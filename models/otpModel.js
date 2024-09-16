const OTPModel = require("./schemas/otpSchema");

// create new OTP
exports.addOTP = (obj) => OTPModel.create(obj);

// find OTP by query
exports.getOTP = (query) => OTPModel.findOne(query);

// delete OTPs
exports.deleteOTPs = (phone) => OTPModel.deleteMany({ phone });