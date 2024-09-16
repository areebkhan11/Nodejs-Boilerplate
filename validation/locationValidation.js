const joi = require("joi");

// location validation
exports.locationValidation = joi.object({
    name: joi.string().required(),
    activity: joi.string().required(),
    address: joi.object().required(),
    distance: joi.number(),
    geofencing: joi.array().required()
});
