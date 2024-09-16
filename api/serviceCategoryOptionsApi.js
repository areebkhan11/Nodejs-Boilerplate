const router = require('express').Router();
const { addOptions, fetchOptionsByCategory } = require('../controller/serviceController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class ServiceCategoryOptionsAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/:categoryId',
            authMiddleware(Object.values(ROLES)),
            fetchOptionsByCategory);

        router.post('/',
            authMiddleware(Object.values(ROLES)),
            addOptions);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/service-options';
    }
}

module.exports = ServiceCategoryOptionsAPI;
