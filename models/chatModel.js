const { getMongoosePaginatedData } = require("../utils");
const ChatModel = require("./schemas/chatSchema");

//add chat
exports.createChat = (obj) => ChatModel.create(obj);

//get chat by ID
exports.getChatById = (id) => ChatModel.findById(id);

//get unique chat
exports.getUniqueChat = (senderId, receiverId) => ChatModel.find({ sender: senderId, receiver: receiverId });

//update chat by ID
exports.updateChatById = (id, obj) => ChatModel.findByIdAndUpdate(id, obj, { new: true });

//get all chats
exports.getAllChats = async ({ query, page, limit }) => {
    const { data, pagination } = await getMongoosePaginatedData({
        model: ChatModel,
        query,
        page,
        limit
    });
    return { chats: data, pagination };
};

//delete chat by ID
exports.deleteChatById = (chatId) => ChatModel.findByIdAndUpdate(chatId, { isDeleted: true }, { new: true });

