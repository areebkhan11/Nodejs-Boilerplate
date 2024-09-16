const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

  const vehicleTypeSchema = new Schema({
    vehicletype: { type: String},
    weightage: { type: Number },    
    sippcodes: { type: [String] },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

vehicleTypeSchema.plugin(mongoosePaginate);
vehicleTypeSchema.plugin(aggregatePaginate);

const VehicleModel = model('VehicleType', vehicleTypeSchema);

module.exports = VehicleModel;