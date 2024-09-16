const router = require('express').Router();
const { startTask, getAllTasks, deleteTaskById, getTaskById, updateTaskById, getAllTodaysTasks, getAllUserTasks } = require("../controller/taskController");
const { ROLES } = require("../utils/constants");
const authMiddleware = require('../middlewares/Auth');
const { upload } = require("../utils");

class TaskAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }
    setupRoutes() {
        const router = this.router;
        router.post('/', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), startTask);
        router.get('/today', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), getAllTodaysTasks);
        router.get('/', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), getAllTasks);
        router.put('/:taskId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), upload('Tasks').array('images', 4), updateTaskById);
        // router.put('/:taskId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), upload('tasks').fields([{ name: 'image', maxCount: 1 }]), updateTaskById);
        router.get('/:taskId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), getTaskById);
        router.delete('/:taskId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), deleteTaskById);
        router.get('/today/:userId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER, ROLES.EMPLOYEE]), getAllUserTasks);
    }
    getRouter() {
        return this.router;
    }
    getRouterGroup() {
        return '/task';
    }
}

module.exports = TaskAPI; 