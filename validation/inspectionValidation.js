const Joi = require("joi");

// inspection record validation
exports.inspectRecordValidation = Joi.object({
    vehicleID: Joi.string().trim().required(),
    images: Joi.array().items(Joi.string().trim()).required(),
    details: Joi.string().trim().required(),
    reportedBy: Joi.string().trim().required(),
    notes: Joi.string().trim(),
    vin: Joi.string().trim().required(),

});