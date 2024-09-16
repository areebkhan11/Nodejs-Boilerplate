const router = require('express').Router();
const { addSingleService, fetchServiceByType } = require('../controller/serviceController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class ServiceTypeAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        // router.get('/',
        //     authMiddleware(Object.values(ROLES)),
        //     fetchServiceByType);

        router.post('/',
            authMiddleware(Object.values(ROLES)),
            addSingleService);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/single-service';
    }
}

module.exports = ServiceTypeAPI;
