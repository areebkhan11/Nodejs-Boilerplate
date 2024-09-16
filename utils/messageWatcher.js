const ChatModel = require('../models/schemas/chatSchema');

let lastCheckedTimestamp = new Date(); // Initialize lastCheckedTimestamp with current time

// Function to periodically check for new messages
async function checkForNewMessages(io) {
    try {
        const newMessages = await ChatModel.find({ createdAt: { $gt: lastCheckedTimestamp } });
        if (newMessages.length > 0) {
            const sender = newMessages[0].sender;
            const receiver = newMessages[0].receiver;
            const newMessage = await ChatModel.find({
                $or: [
                    { sender, receiver },
                    { sender: receiver, receiver: sender } // Include messages sent in reverse order
                ]
            }).sort({ createdAt: 1 });
            // Emit new messages to all connected clients
            io.emit('newMessage', newMessage);
            lastCheckedTimestamp = new Date(); // Update lastCheckedTimestamp to the latest message timestamp
        }
    } catch (error) {
        console.error('Error checking for new messages:', error);
    }
}

// Export the function
module.exports = checkForNewMessages;