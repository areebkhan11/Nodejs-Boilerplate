const router = require ('express').Router();
const { getAllVehicleTypes, addVehicleType, updateVehicleType, deleteVehicleType, getVehicleType } = require ('../controller/vehicleTypeController');
const authMiddleware = require ('../middlewares/Auth');
const { ROLES } = require ('../utils/constants');

class VehicleTypeAPI {
    constructor () {
        this.router = router;
        this.setupRoutes ();
    }

    setupRoutes () {
        const router = this.router;

        router.post ('/', addVehicleType);
        router.get ('/search', authMiddleware (Object.values (ROLES)), getAllVehicleTypes);
        router.get ('/:vehicleTypeId', authMiddleware (Object.values (ROLES)), getVehicleType);
        router.patch ('/:vehicleTypeId', authMiddleware (Object.values (ROLES)), updateVehicleType);
        router.delete ('/:vehicleTypeId', authMiddleware (Object.values (ROLES)), deleteVehicleType);

    }
    getRouter () {
        return this.router;
    }
    getRouterGroup () {
        return '/vehicle-type';
    }
}

module.exports = VehicleTypeAPI;
