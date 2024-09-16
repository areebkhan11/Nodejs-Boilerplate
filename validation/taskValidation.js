const Joi = require("joi");

//task validation
exports.taskValidation = Joi.object({
    user: Joi.string().trim(),
    vin: Joi.string().trim().pattern(new RegExp('[A-HJ-NPR-Z0-9]{17}')).required(),
    locationTo: Joi.string().trim().required(),
    locationFrom: Joi.string().trim().required(),
    status: Joi.string().required(),
    startTask: Joi.date().required(),
    endTask: Joi.date(),
    details: Joi.number(),
    desc: Joi.string(),
});

