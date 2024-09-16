const router = require('express').Router();
const {
    getAllVehicleCategories,
    addVehicleCategory,
    updateVehicleCategory,
    deleteVehicleCategory,
    getVehicleCategory
} = require('../controller/vehicleCategoryController');
const authMiddleware = require('../middlewares/Auth');
const { ROLES } = require('../utils/constants');
const { upload } = require('../utils');

class VehicleCategoryAPI {
    constructor() {
        this.router = router;
        this.setupRoutes();
    }

    setupRoutes() {
        const router = this.router;

        router.get('/search', authMiddleware(Object.values(ROLES)), getAllVehicleCategories);
        router.get('/:categoryId', authMiddleware(Object.values(ROLES)), getVehicleCategory);
        router.post('/', authMiddleware(Object.values(ROLES)),
            upload('VehicleCategories').fields([{ name: 'image', maxCount: 1 }]),
            addVehicleCategory);

        router.put('/:categoryId', authMiddleware(Object.values(ROLES)),
            upload('VehicleCategories').fields([{ name: 'image', maxCount: 1 }]),
            updateVehicleCategory);

        router.delete('/:categoryId', authMiddleware(Object.values(ROLES)), deleteVehicleCategory);
    }

    getRouter() {
        return this.router;
    }

    getRouterGroup() {
        return '/vehicle-category';
    }
}

module.exports = VehicleCategoryAPI;
