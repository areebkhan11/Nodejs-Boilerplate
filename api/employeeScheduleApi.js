const router = require('express').Router();
const {
    getAllEmployeeSchedules
} = require('../controller/employeeScheduleController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class EmployeeScheduleApi {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/', authMiddleware(Object.values(ROLES)), getAllEmployeeSchedules);

    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/employeeSchedule';
    }
}

module.exports = EmployeeScheduleApi;
