const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const fuelTypeSchema = new Schema({
    fuelType: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

fuelTypeSchema.plugin(mongoosePaginate);
fuelTypeSchema.plugin(aggregatePaginate);

const FuelModel = model('fuelType', fuelTypeSchema);

module.exports = FuelModel;