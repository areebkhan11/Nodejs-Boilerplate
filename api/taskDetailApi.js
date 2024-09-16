const router = require('express').Router();
const { saveAllTasksForToday ,getTasksCount} = require('../controller/taskDetailController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class TaskDetailAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }
    setupRoutes() {
        const router = this.router;
        router.post('/', authMiddleware([ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.TEAM_LEAD, ROLES.ADMIN]), saveAllTasksForToday);
        router.get('/', authMiddleware([ROLES.EMPLOYEE, ROLES.MANAGER,ROLES.TEAM_LEAD, ROLES.ADMIN]), getTasksCount);
    }
    getRouter() {
        return this.router;
    }
    getRouterGroup() {
        return '/taskDetail';
    }
}
module.exports = TaskDetailAPI;