const {
    createFuel,
    updateFuelById,
    getAllFuels,
    getFuelById,
    getFuelsByName,
    deleteFuelById } = require('../models/fuelTypeModel');
const { generateResponse, parseBody } = require("../utils");
const { STATUS_CODES } = require('../utils/constants');


exports.createFuelType = async (req, res, next) => {
    const body = parseBody(req.body);

    try {
        const singleFuelType = await getFuelsByName({ fuelType: body.fuelType });
        if (singleFuelType) return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: 'Fuel Type already exists'
        });

        const fuelType = await createFuel(body);
        generateResponse(fuelType, 'Fuel type created successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.updateFuelType = async (req, res, next) => {
    const body = parseBody(req.body);
    const { fuelTypeId } = req.params;

    try {
        const fuelType = await updateFuelById(fuelTypeId, body);
        if (!fuelType) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Fuel type not found'
        });

        generateResponse(fuelType, 'Fuel type updated successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.deleteFuelType = async (req, res, next) => {
    const { fuelTypeId } = req.params;

    try {
        const fuelType = await deleteFuelById(fuelTypeId);
        if (!fuelType) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Fuel type not found'
        });

        generateResponse(null, 'Fuel type deleted successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.getAllFuelTypes = async (req, res, next) => {
    const { search = "" } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const query = { fuelType: { $regex: search, $options: 'i' }, isDeleted: false };

    try {
        const data = await getAllFuels({ query, page, limit });

        if (data?.fuelTypes?.length === 0) {
            generateResponse(null, 'No fuel types found', res);
            return;
        }

        generateResponse(data, 'Fuel types fetched successfully', res);
    } catch (error) {
        next(error);
    }
}
