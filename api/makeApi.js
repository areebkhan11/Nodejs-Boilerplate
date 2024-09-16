const router = require('express').Router();
const {
    createVehicleMake,
    updateVehicleMake,
    deleteVehicleMake,
    getAllVehicleMakes
} = require('../controller/vehicleController');
const authMiddleware = require('../middlewares/Auth');
const { upload } = require('../utils');
const { ROLES } = require('../utils/constants');

class MakeAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/', authMiddleware(Object.values(ROLES)), getAllVehicleMakes);

        router.post('/',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
            // upload('makes').fields([{ name: 'image', maxCount: 1 }]),
            createVehicleMake);

        router.put('/:makeId',
            authMiddleware([ROLES.ADMIN, ROLES.MANAGER]),
            // upload('makes').fields([{ name: 'image', maxCount: 1 }]),
            updateVehicleMake);

        router.delete('/:makeId', authMiddleware([ROLES.ADMIN]), deleteVehicleMake);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/make';
    }
}
//this is the comment to check deployemt.

module.exports = MakeAPI;
