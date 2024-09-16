const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const vehicleCategorySchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    // image: { type: String },
    code: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

vehicleCategorySchema.plugin(mongoosePaginate);
vehicleCategorySchema.plugin(aggregatePaginate);

const VehicleModel = model('VehicleCategory', vehicleCategorySchema);

module.exports = VehicleModel;