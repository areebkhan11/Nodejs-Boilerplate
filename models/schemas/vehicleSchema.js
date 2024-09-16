const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { VEHICLE_CATEGORY } = require("../../utils/constants");

const vehicleSchema = new Schema({
    vin: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'VehicleCategory' },
    type: { type: Schema.Types.ObjectId, ref: 'VehicleType' },
    make: { type: Schema.Types.ObjectId, ref: 'Make' },
    apiFetch: { type: Boolean },
    modelYear: { type: Number },
    model: { type: String },
    country: { type: String },
    region: { type: String },
    fuelType: { type: Schema.Types.ObjectId, ref: 'fuelType' },
    description: { type: String },
    odometer: { type: Number },
    kw_capacity: { type: String },
    license_plate_no: { type: String },
    seating_capacity: { type: Number },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

vehicleSchema.plugin(mongoosePaginate);
vehicleSchema.plugin(aggregatePaginate);

const VehicleModel = model('Vehicle', vehicleSchema);

module.exports = VehicleModel;