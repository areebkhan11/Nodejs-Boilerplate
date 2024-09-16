const router = require('express').Router();
const { addNewService, fetchAllServices, updateService, deleteService } = require('../controller/serviceController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class ServiceAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            fetchAllServices);

        router.post('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            upload('services').fields([{ name: 'image', maxCount: 1 }]),
            addNewService);

        router.put("/:serviceId",
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            upload('services').fields([{ name: 'image', maxCount: 4 }]),
            updateService);

        router.delete("/:serviceId",
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            deleteService);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/service';
    }
}

module.exports = ServiceAPI;
