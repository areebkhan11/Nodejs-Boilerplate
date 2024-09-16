const { createVehicleType, getVehicleType, updateVehicleType, getAllVehicleTypes, deleteVehicleType } = require('../models/vehicleTypeModel');
const { generateResponse, parseBody } = require("../utils");
const { vehicleTypeValidation } = require('../validation/typeValidation');
const { requestQueryValidation } = require('../validation/common');
const { STATUS_CODES } = require('../utils/constants');

// add vehicle type
exports.addVehicleType = async (req, res, next) => {
    const body = parseBody(req.body);

    //Joi validation
    const { error } = vehicleTypeValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });
    try {
        //   //  check if vehicle type already exists
        const vehicleTypeExist = await getVehicleType({ vehicletype: body.vehicletype, isDeleted: false });
        if (vehicleTypeExist) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Vehicle type already exists'
        });
        const vehicleType = await createVehicleType(body);
        generateResponse(vehicleType, 'Vehicle type added successfully', res);
    } catch (error) {
        (error);
    }
}

// update vehicle type
exports.updateVehicleType = async (req, res, next) => {
    const { vehicleTypeId } = req.params;
    const body = req.body;

    // Joi validation
    const { error } = vehicleTypeValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const vehicleType = await updateVehicleType({ _id: vehicleTypeId }, body);
        generateResponse(vehicleType, 'Vehicle type updated successfully', res);
    } catch (error) {
        next(error);
    }
}

// get all vehicle types
exports.getAllVehicleTypes = async (req, res, next) => {
    // Joi validation
    const { error } = requestQueryValidation.validate(req.query);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    const { search = "" } = req.query;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;

    const query = { $and: [{ vehicletype: { $regex: search, $options: 'i' }, isDeleted: false }] };

    try {
        const typeData = await getAllVehicleTypes({ query, page, limit });
        if (!typeData.length === 0) {
            generateResponse(null, 'No vehicle types found', res);
            return;
        }
        generateResponse(typeData, 'Vehicle types retrieved successfully', res);
    }
    catch (error) {
        next(error);
    }
}

// get vehicle type
exports.getVehicleType = async (req, res, next) => {
    const { vehicleTypeId } = req.params;
    try {
        const vehicleType = await getVehicleType({ _id: vehicleTypeId });
        if (!vehicleType) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle type not found'
        });
        generateResponse(vehicleType, 'Vehicle type retrieved successfully', res);
    }
    catch (error) {
        next(error);
    }
}

// delete vehicle type
exports.deleteVehicleType = async (req, res, next) => {
    const { vehicleTypeId } = req.params;
    if (!vehicleTypeId) {
        return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Vehicle type id is required'
        });
    }

    try {
        const vehicleType = await deleteVehicleType(vehicleTypeId);

        if (!vehicleType) {
            return next({
                statusCode: STATUS_CODES.NOT_FOUND,
                message: 'Vehicle type not found'
            });
        }

        generateResponse(null, 'Vehicle type deleted successfully', res);
    } catch (error) {
        next(error);
    }
}


