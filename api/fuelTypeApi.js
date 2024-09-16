const router = require('express').Router();
const {
    createFuelType,
    updateFuelType,
    deleteFuelType,
    getAllFuelTypes
} = require('../controller/fuelTypeController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');

class FuelTypeAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/', authMiddleware(Object.values(ROLES)), getAllFuelTypes);

        router.post('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
            createFuelType);

        router.put('/:fuelTypeId',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
            updateFuelType);

        router.delete('/:fuelTypeId', authMiddleware([ROLES.ADMIN]), deleteFuelType);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/fuelType';
    }
}

module.exports = FuelTypeAPI;
