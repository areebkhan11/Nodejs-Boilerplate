const router = require('express').Router();
const {
    getAllChats,
    createChat,
    sendChatImage,
    deleteChat,
} = require('../controller/chatController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class ChatAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        // router.get('/', authMiddleware(Object.values(ROLES)), getAllChats);
        router.post('/',
            authMiddleware(Object.values(ROLES)),
            upload('chats').fields([{ name: 'image', maxCount: 1 }]),
            createChat);

        router.put('/:receiverId',
            authMiddleware(Object.values(ROLES)),
            upload('chats').fields([{ name: 'image', maxCount: 1 }]),
            sendChatImage);

        router.delete('/:chatId', authMiddleware(Object.values(ROLES)), deleteChat);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/chat';
    }
}

module.exports = ChatAPI;
