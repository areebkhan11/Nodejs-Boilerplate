const router = require('express').Router();
const {register,login} = require('../controller/authController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class AuthAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        let router = this.router;

        router.post('/register', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]), register);
        router.post('/login', login);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/auth';
    }
}

module.exports = AuthAPI;
