const Joi = require('joi');
const { ROLES } = require('../utils/constants');

// register user validation
exports.registerUserValidation = Joi.object({
    email: Joi.string().email().required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().optional(),
    phone: Joi.string().trim().required(),
    password: Joi.string().min(8).max(20).required(),
    role: Joi.string().valid(...Object.values(ROLES)).required(),
    vin: Joi.string().trim().optional(),
});

// login user validation
exports.loginUserValidation = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(30).required(),
    platform: Joi.string().required(),
    fcmToken: Joi.string().optional(),
});

// forgot password validation
exports.resetPasswordLinkValidation = Joi.object({
    email: Joi.string().trim().email().required(),
});