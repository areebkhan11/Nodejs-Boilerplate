const { Schema, model } = require("mongoose");

const otpSchema = new Schema({
    phone: { type: String, required: true },
    otp: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now },
}, { versionKey: false });

otpSchema.methods.isExpired = function () {
    return Date.now() - this.createdAt > Number(process.env.OTP_EXPIRATION);
}

const OTPModel = model("Otp", otpSchema);

module.exports = OTPModel;
