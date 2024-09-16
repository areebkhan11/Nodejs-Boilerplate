const Joi = require('joi');
const { ROLES , ROLES_TYPE } = require('../../utils/constants');

exports.requestQueryValidation = Joi.object({
    page: Joi.number().integer().positive().optional(),
    limit: Joi.number().integer().positive().optional(),
    search: Joi.string().optional(),
    firstName: Joi.string().optional(),
    role: Joi.string().valid(...Object.values(ROLES)),
    roleType: Joi.string().valid(...Object.values(ROLES_TYPE)),
    isActive: Joi.boolean(),
    userRole: Joi.string().optional(),
});


exports.updateUserValidation = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.number().integer().positive().optional(),
});

