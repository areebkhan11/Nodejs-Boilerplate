const socketIO = require('socket.io');
const { updateUser, getAllUsers, findUsersById } = require('./models/userModel');
const { getAllUsersBySchedules } = require('./models/scheduleModel')
const { getProcessTime, calculateAndUpdateProcessTime } = require('./models/processTimeModel')
const ProcessTime = require('./models/schemas/processTime')
const { findAll } = require('./models/shiftModel');
const ChatModel = require('./models/schemas/chatSchema');
const checkForNewMessages = require('./utils/messageWatcher');


exports.io = (server) => {
    const io = socketIO(server, { cors: { origin: "*" } });
    let senderId = null;

    io.on('connection', async (socket) => {
        senderId = socket.handshake?.headers?.userid;
        try {
            const userObj = await updateUser({ _id: socket.handshake?.headers?.userid }, { $set: { online: true } });
            socket.broadcast.emit('user-connected', userObj);

            // Send all users' locations to the connected user
            const allUsers = await getAllUsers();
            io.to(socket.id).emit('all-users-locations', allUsers);

            socket.on('update-location', async ({ userId, location }) => {
                try {
                    const updatedLocation = [location.lat, location.lng];
                    const updatedUser = await updateUser({ _id: userId }, { $set: { location: updatedLocation } });
                    io.emit('user-location-updated', updatedUser);

                    // Update all users' locations and broadcast to everyone
                    const updatedAllUsers = await findAll();
                    io.emit('all-shift-users-locations', updatedAllUsers);
                } catch (error) {
                    console.error('Error updating user location:', error);
                }
            });

            socket.on('update-process-time', async ({ scheduleId, isBreak }) => {
                try {
                    // Find the process time document for the given scheduleId
                    let processTime = await getProcessTime({ schedule: scheduleId });

                    if (!processTime) {
                        // If no process time document exists, create a new one with the given scheduleId
                        processTime = new ProcessTime({
                            schedule: scheduleId,
                            startTime: new Date(), // Set startTime to the current time
                            endTime: new Date(),   // Set endTime to the current time
                            break: isBreak,
                            totalBreakTime: 0,
                        });

                        await processTime.save();
                    } else {
                        if (isBreak) {
                            // If isBreak is true, pause the time by updating the break status
                            processTime.break = true;
                            processTime.breakStartTime = new Date(); // Set breakStartTime to the current time
                        } else {
                            // If isBreak is false, resume the time by updating the break status
                            processTime.break = false;
                            processTime.endTime = new Date(); // Update endTime to the current time

                            // Update total break time
                            if (processTime.breakStartTime) {
                                const breakDuration = (new Date() - processTime.breakStartTime);
                                processTime.totalBreakTime += breakDuration;
                                processTime.breakStartTime = null; // Reset breakStartTime
                            }
                        }
                        await processTime.save();
                    }

                    // Calculate and update process time
                    const updatedProcessTime = await calculateAndUpdateProcessTime(scheduleId);

                    // Broadcast the updated process time to all connected clients
                    io.emit('process-time-updated', updatedProcessTime);
                } catch (error) {
                    console.error('Error updating process time:', error);
                }
            });

            socket.on('sendMessage', async (messageData) => {
                try {
                    const { sender, receiver, message } = messageData;
                    const messageSave = new ChatModel({ sender, receiver, message });
                    await messageSave.save();
                    receiverId = receiver;
                    const newMessage = await ChatModel.find({
                        $or: [
                            { sender, receiver },
                            { sender: receiver, receiver: sender } // Include messages sent in reverse order
                        ]
                    }).sort({ createdAt: 1 });
                    // Emit the new message only to the receiver
                    io.emit('newMessage', newMessage);

                } catch (error) {
                    console.error('Error saving message:', error);
                }
            });


            socket.on('getPastChats', async ({ sender, receiver }) => {
                try {
                    const pastChats = await ChatModel.find({
                        $or: [
                            { sender, receiver },
                            { sender: receiver, receiver: sender } // Include messages sent in reverse order
                        ]
                    }).sort({ createdAt: 1 });
                    socket.emit('pastChats', pastChats); // Send past chats to the client
                } catch (error) {
                    console.error('Error fetching past chats:', error);
                }
            });

            socket.on('getPastUsers', async ({ currentUserId }) => {
                try {
                    const pastChats = await ChatModel.find({
                        $or: [
                            { sender: currentUserId },
                            { receiver: currentUserId }
                        ]
                    }).sort({ createdAt: 1 });
                    // Extract unique receiver IDs from past chats
                    const receiverIds = pastChats.reduce((ids, chat) => {
                        const otherUserId = chat.sender.equals(currentUserId) ? chat.receiver : chat.sender;
                        if (!ids.find(id => id.equals(otherUserId))) {
                            ids.push(otherUserId);
                        }
                        return ids;
                    }, []);

                    const Users = await findUsersById({ _id: { $in: receiverIds } });


                    socket.emit('pastUsers', Users); // Send list of past receiver IDs to the client
                } catch (error) {
                    console.error('Error fetching past users:', error);
                }
            });


            socket.on('disconnect', async () => {
                try {
                    const userObj = await updateUser({ _id: socket.handshake?.headers?.userid }, { $set: { online: false } });
                    socket.emit('user-disconnected', userObj);

                    // Update all users' locations and broadcast to everyone
                    const updatedAllUsers = await getAllUsersBySchedules();
                    io.emit('all-users-locations', updatedAllUsers);
                } catch (error) {
                    console.error('Error handling disconnect:', error);
                }
            });


        } catch (error) {
            console.error('Error handling connection:', error);
        }
    });

    setInterval(() => {
        checkForNewMessages(io);
    }, 5000);
};