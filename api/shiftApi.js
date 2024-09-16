const router = require('express').Router();
const { addShift, updateShift, getTodayShifts, getAllShifts } = require('../controller/shiftController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class ShiftAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }
    setupRoutes() {
        const router = this.router;
        router.post('/', authMiddleware([ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN]), addShift);
        router.get('/', authMiddleware([ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN, ROLES.TEAM_LEAD]), getTodayShifts);
        router.get('/search', authMiddleware([ROLES.EMPLOYEE, ROLES.MANAGER, ROLES.ADMIN, ROLES.TEAM_LEAD]), getAllShifts);
        router.put('/:id', authMiddleware([ROLES.MANAGER, ROLES.ADMIN, ROLES.TEAM_LEAD, ROLES.EMPLOYEE]), updateShift);
    }
    getRouter() {
        return this.router;
    }
    getRouterGroup() {
        return '/shift';
    }
}
module.exports = ShiftAPI;