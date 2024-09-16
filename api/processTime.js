const router = require('express').Router();
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const { getProcessTimes, getEmployeeSchedule, downloadEmployeeSchedule } = require('../controller/processTimeController')


class ProcessTimeAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.TEAM_LEAD]),
            getProcessTimes);

        router.get('/employee-schedule',
            authMiddleware([ROLES.EMPLOYEE]),
            getEmployeeSchedule);

        router.get('/download-employee-schedule',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
            downloadEmployeeSchedule);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/process-time';
    }
}

module.exports = ProcessTimeAPI;
