const Joi = require("joi");

// vehicle category validation
exports.vehicleCategoryValidation = Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().optional(),
    code: Joi.string().trim().required(),
});