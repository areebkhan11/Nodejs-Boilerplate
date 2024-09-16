const router = require('express').Router();
const { createLocation, getAllLocations, updateLocationById, deleteLocationById } = require("../controller/locationController");
const authMiddleware = require("../middlewares/Auth");
const { ROLES } = require("../utils/constants");

class LocationAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }
    setupRoutes() {
        const router = this.router;
        router.post('/', authMiddleware([ROLES.ADMIN]), createLocation);
        router.get('/', authMiddleware([ROLES.EMPLOYEE, ROLES.ADMIN, ROLES.MANAGER]), getAllLocations);
        router.put('/:locationId', authMiddleware([ROLES.ADMIN, ROLES.MANAGER]), updateLocationById);
        router.delete('/:locationId', authMiddleware([ROLES.ADMIN]), deleteLocationById);


    }
    getRouter() {
        return this.router;
    }
    getRouterGroup() {
        return '/location';
    }

}

module.exports = LocationAPI;