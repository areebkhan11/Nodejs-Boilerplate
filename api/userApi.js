const router = require('express').Router();
const { searchAllUsers, deleteUser, searchAllUsersByRole, getAllUsersByRole, generateOTP, verifyOTP, changePassword, resetPassword, sendResetPasswordLink, uploadImage, updateSingleUser } = require('../controller/userController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class UserAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.get('/getRoles/:role', getAllUsersByRole);
        router.get('/search', authMiddleware(Object.values(ROLES)), searchAllUsers);
        router.get('/search-selected-role', authMiddleware(Object.values(ROLES)), searchAllUsersByRole);
        router.post('/otp', generateOTP);
        router.put('/verify', verifyOTP);
        router.put('/change-password', authMiddleware(Object.values(ROLES)), changePassword);
        // Dashboard API
        router.put('/reset-password', resetPassword);
        router.put('/reset-link', sendResetPasswordLink);
        router.put('/upload-image', authMiddleware(Object.values(ROLES)), upload('users').single('image'), uploadImage);
        router.put('/:userId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER]), updateSingleUser);
        router.delete('/:userId', authMiddleware([ROLES.ADMIN]), deleteUser);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/user';
    }
}

module.exports = UserAPI;
