const router = require('express').Router();
const { createInspection, getInspectionById, updateInspectionById, getAllInspections, deleteInspectionById } = require("../controller/inspectionController");
const authMiddleware = require("../middlewares/Auth");
const { upload } = require("../utils");
const { ROLES } = require("../utils/constants");

class InspectionAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;
        router.post('/', authMiddleware([ROLES.ADMIN]), upload('Inspections').array('images', 4), createInspection);
        router.get('/', authMiddleware([ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.MANAGER]), getAllInspections);
        router.get('/:inspectionId', authMiddleware([ROLES.EMPLOYEE]), getInspectionById);
        router.put('/:inspectionId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER]), upload('Inspections').array('images', 4), updateInspectionById);
        router.delete('/:inspectionId', authMiddleware([ROLES.ADMIN]), deleteInspectionById);
    }

    getRouter() {
        return this.router;
    }
    getRouterGroup() {
        return '/inspectionRecord';
    }
}

module.exports = InspectionAPI;

