const router = require('express').Router();
const {
    addVehicle,
    getVehicle,
    updateVehicle,
    getAllVehicles,
    deleteVehicle,
    getUniqueModelYears,
    getUniqueVehicleMakes,
    getUniqueVehicleModels,
    getVehiclesByFilters,
    createVehicleMake,
    updateVehicleMake
} = require('../controller/vehicleController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class VehicleAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/search', authMiddleware(Object.values(ROLES)), getAllVehicles);

        // all vehicle modelYears by category
        router.get('/year', authMiddleware(Object.values(ROLES)), getUniqueModelYears);
        // get all vehicle makes by modelYear & category
        router.get('/make', authMiddleware(Object.values(ROLES)), getUniqueVehicleMakes);
        // get all vehicle models by modelYear & category & make
        router.get('/model', authMiddleware(Object.values(ROLES)), getUniqueVehicleModels);
        // get vehicles by modelYear & category & make & model
        router.get('/filters', authMiddleware(Object.values(ROLES)), getVehiclesByFilters);


        router.get('/find', authMiddleware(Object.values(ROLES)), getVehicle);

        router.post('/',
            authMiddleware(Object.values(ROLES)),
            upload('vehicles').single('image'),
            addVehicle);

        router.put('/:vehicleId', authMiddleware(Object.values(ROLES)), updateVehicle);
        router.delete('/:vehicleId', authMiddleware(Object.values(ROLES)), deleteVehicle);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/vehicle';
    }
}

module.exports = VehicleAPI;
