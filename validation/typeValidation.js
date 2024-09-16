const Joi = require("joi");

//vehicle type validation
exports.vehicleTypeValidation = Joi.object({
    vehicletype: Joi.string().trim().required(),
    sippcodes: Joi.array().items(Joi.string().trim()).required(),
    weightage: Joi.number().positive().required(),
});