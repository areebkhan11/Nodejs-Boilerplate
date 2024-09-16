const Joi = require('joi');
const { VEHICLE_CATEGORY } = require('../utils/constants');

// add vehicle validation
exports.vehicleValidation = Joi.object({
    vin: Joi.string().trim().required(),
    category: Joi.string().trim(),
    country: Joi.string().trim(),
    autoFetch: Joi.boolean(),
    modelYear: Joi.number().integer().positive(),
    make: Joi.string().trim(),
    type: Joi.string().trim(),
    model: Joi.string().trim(),
    description: Joi.string().trim(),
    odometer: Joi.number().integer().positive(),
    kw_capacity: Joi.string().trim(),
    license_plate_no: Joi.string().trim(),
    seating_capacity: Joi.number().integer().positive(),
    fuelType: Joi.string().trim(),
});
