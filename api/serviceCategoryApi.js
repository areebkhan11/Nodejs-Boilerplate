const router = require('express').Router();
const { addServiceCategory, fetchServiceCategories, fetchAllServiceCategories } = require('../controller/serviceController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class SingleServiceAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/', authMiddleware(Object.values(ROLES)), fetchServiceCategories);
        router.get('/search', authMiddleware(Object.values(ROLES)), fetchAllServiceCategories);

        //     router.get('/:inspectionId',
        //     authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
        //     fetchInspection);

        router.post('/',
            authMiddleware(Object.values(ROLES)),
            // upload('service-categories').fields([{ name: 'image', maxCount: 1 }]),
            addServiceCategory);

        // router.put('/service-status',
        //     authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
        //     updateInspectionServiceResult);

        // // mark as completed API
        // router.put("/complete/:inspectionId",
        //     authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
        //     markAsCompleted);


    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/service-category';
    }
}

module.exports = SingleServiceAPI;
