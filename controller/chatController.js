const {
    createChat,
    updateChatById,
    deleteChatById,
    getUniqueChat
} = require('../models/chatModel');
const { generateResponse, parseBody } = require("../utils");
const { STATUS_CODES } = require('../utils/constants');


exports.createChat = async (req, res, next) => {
    const body = parseBody(req.body);

    if (!req?.files?.image || req?.files?.image.length === 0) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Image is required'
    });

    body.image = req.files?.image[0].path;

    try {
        const chat = await createChat(body);
        generateResponse(chat, 'created successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.sendChatImage = async (req, res, next) => {
    const body = {}
    const { receiverId } = req.params;
    const senderId = req.user.id;

    try {
        if (!receiverId) {
            return next({
                statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: 'ReceiverId is required'
            });
        }

        if (!req?.files?.image || req?.files?.image.length === 0) return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: 'Image is required'
        });

        body.sender = senderId;
        body.receiver = receiverId;
        body.image = req.files?.image[0].path;
        // const pastChat = await getUniqueChat(senderId, receiverId);
        const chat = await createChat(body);
        if (!chat) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'chat not found'
        });

        generateResponse(chat, 'Image sent successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.deleteChat = async (req, res, next) => {
    const { chatId } = req.params;
    try {
        const chat = await deleteChatById(chatId);
        if (!chat) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'chat not found'
        });

        generateResponse(null, 'Vehicle make deleted successfully', res);
    } catch (error) {
        next(error);
    }
}