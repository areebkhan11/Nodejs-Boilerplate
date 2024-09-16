const Joi = require("joi");

exports.generateOtpValidation = Joi.object({
    phone: Joi.string().trim().required(),
});

exports.otpVerifyValidation = Joi.object({
    otp: Joi.number().integer().positive().min(100000).max(999999).required(),
});

exports.changePasswordValidation = Joi.object({
    oldPassword: Joi.string().min(8).max(30).required(),
    newPassword: Joi.string().min(8).max(30).required(),
});

exports.resetPasswordValidation = Joi.object({
    newPassword: Joi.string().min(8).max(30).required(),
    resetPasswordToken: Joi.string().trim().required(),
});