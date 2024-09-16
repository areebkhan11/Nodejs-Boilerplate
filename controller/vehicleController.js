const { createMake, updateMakeById, getAllMakes, deleteVehicleMakeById, getMakesByManufacturer } = require("../models/makeModel");
const {
    createVehicle,
    updateVehicle,
    getAllVehicles,
    getVehicle,
    getVehicles,
    deleteVehicleById
} = require("../models/vehicleModel");

const { parseBody, generateResponse } = require("../utils");
const { STATUS_CODES, VEHICLE_CATEGORY } = require("../utils/constants");
const { vehicleValidation } = require("../validation/vehicleValidation");
const { getVehiclesQuery } = require("./queries/vehiclesQuries")


// add vehicle
exports.addVehicle = async (req, res, next) => {
    let body = parseBody(req.body);
    // Joi validation
    const { error } = vehicleValidation.validate(req.body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });
    if (req?.file) {
        body.image = req.file.path;
    }
    try {
        // check if vehicle already exists
        const vehicleExist = await getVehicle({ vin: body.vin });
        if (vehicleExist) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Vehicle already exists'
        });

        // a manufacturer will be added if the information is fetched by the 3P api

        if (req.body.autoFetch === true) {
            const manufacturer = await getMakesByManufacturer({ manufacturer: body.manufacturer });
            if (!manufacturer) {
                const obj = { manufacturer: body.make }
                const make = await createMake(obj);
                body.make = make._id

            }
        }
        const vehicle = await createVehicle(body);
        generateResponse(vehicle, 'Vehicle added successfully', res);
    } catch (error) {
        next(error);
    }
}

// get vehicle by vin
exports.getVehicle = async (req, res, next) => {
    const { vin } = req.query;

    try {
        const vehicle = await getVehicle({ vin });
        if (!vehicle) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle not found'
        });

        generateResponse(vehicle, 'Vehicle fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

// update vehicle
exports.updateVehicle = async (req, res, next) => {
    const body = parseBody(req.body);
    const { vehicleId } = req.params;

    // Joi validation
    const { error } = vehicleValidation.validate(req.body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const vehicle = await updateVehicle({ _id: vehicleId }, { $set: body });
        if (!vehicle) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle not found'
        });

        generateResponse(vehicle, 'Vehicle updated successfully', res);
    } catch (error) {
        next(error);
    }
}

// get all vehicles
exports.getAllVehicles = async (req, res, next) => {
    const { vin, model, type, make } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;


    const filters = [];

    // Iterate over req.query object
    for (const key in req.query) {
        const filter = {};
        filter[key] = req.query[key];
        filters.push(filter);
    }


    const query = getVehiclesQuery(make, vin, model, type, filters);


    try {
        const vehicles = await getAllVehicles({ query, page, limit });
        if (vehicles?.vehicles?.length === 0) {
            generateResponse(null, 'No vehicles found', res);
            return;
        }

        generateResponse(vehicles, 'Vehicles found', res);
    } catch (error) {
        next(error);
    }
}

// delete vehicle
exports.deleteVehicle = async (req, res, next) => {
    const { vehicleId } = req.params;

    try {
        const vehicleExists = await getVehicle({ _id: vehicleId, isDeleted: false });
        if (!vehicleExists) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle not found'
        });

        await deleteVehicleById(vehicleId);

        generateResponse(null, 'Vehicle deleted successfully', res);
    } catch (error) {
        next(error);
    }
}

// get unique vehicle modelYears
exports.getUniqueModelYears = async (req, res, next) => {
    const { category = VEHICLE_CATEGORY.SMALL } = req.query;

    try {
        const vehicles = await getVehicles({ category }).select('modelYear');
        if (vehicles.length === 0) {
            generateResponse(null, 'No vehicles found', res);
            return;
        }

        const modelYears = [...new Set(vehicles.map(vehicle => vehicle.modelYear))].sort((a, b) => b - a);
        generateResponse(modelYears, 'Model years fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

// get unique vehicle makes
exports.getUniqueVehicleMakes = async (req, res, next) => {
    const { category = VEHICLE_CATEGORY.SMALL, modelYear } = req.query;

    try {
        const vehicles = await getVehicles({ category, modelYear })
            .select('make')
            .populate({ path: 'make', select: 'name image' });

        // if no vehicles found
        if (vehicles.length === 0) {
            generateResponse(null, 'No vehicles found', res);
            return;
        }


        const makes = [...new Set(vehicles.map(vehicle => vehicle.make))];
        generateResponse(makes, 'Vehicle makes fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

// get unique vehicle models
exports.getUniqueVehicleModels = async (req, res, next) => {
    const { category = VEHICLE_CATEGORY.SMALL, modelYear, make } = req.query;

    try {
        const vehicles = await getVehicles({ category, modelYear, make }).select('model');
        if (vehicles.length === 0) {
            generateResponse(null, 'No vehicles found', res);
            return;
        }

        const models = [...new Set(vehicles.map(vehicle => vehicle.model))];
        generateResponse(models, 'Vehicle models fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

// get vehicles by category, modelYear, make, model
exports.getVehiclesByFilters = async (req, res, next) => {
    const { category = VEHICLE_CATEGORY.SMALL, modelYear, make, model } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const query = {
        $and: [{ category }, { modelYear }, { make }, { model }]
    }

    try {
        const vehicles = await getAllVehicles({ query, page, limit });
        if (vehicles?.vehicles?.length === 0) {
            generateResponse(null, 'No vehicles found', res);
            return;
        }

        generateResponse(vehicles, 'Vehicles fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.createVehicleMake = async (req, res, next) => {
    const body = parseBody(req.body);
    // if (!req?.files?.image || req?.files?.image.length === 0) return next({
    //     statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
    //     message: 'Image is required'
    // });
    // body.image = req.files?.image[0].path;
    try {
        const manufacturer = await getMakesByManufacturer({ manufacturer: body.manufacturer });
        if (manufacturer) return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: 'Manufacturer already exists'
        });
        const make = await createMake(body);
        generateResponse(make, 'Vehicle make created successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.updateVehicleMake = async (req, res, next) => {
    const body = parseBody(req.body);
    const { makeId } = req.params;

    // if (req?.files?.image?.length > 0) body.image = req.files?.image[0].path;

    try {
        const make = await updateMakeById(makeId, body);
        if (!make) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle make not found'
        });

        generateResponse(make, 'Vehicle make updated successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.deleteVehicleMake = async (req, res, next) => {
    const { makeId } = req.params;
    try {
        const make = await deleteVehicleMakeById(makeId);
        if (!make) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle make not found'
        });

        generateResponse(null, 'Vehicle make deleted successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.getAllVehicleMakes = async (req, res, next) => {
    const { search = "" } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const query = { manufacturar: { $regex: search, $options: 'i' }, isDeleted: false };

    try {
        const data = await getAllMakes({ query, page, limit });

        if (data?.makes?.length === 0) {
            generateResponse(null, 'No vehicle makes found', res);
            return;
        }

        generateResponse(data, 'Vehicle makes fetched successfully', res);
    } catch (error) {
        next(error);
    }
}