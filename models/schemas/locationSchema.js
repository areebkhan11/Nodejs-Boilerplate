   const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const locationSchema = new Schema({
    name: { type: String, required: true },
    activity: { type: String, required: true },
    address: { type: Object, required: true },
    distance: { type: Number, required: false },
    geofencing: { type: [Object], default: [] },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

locationSchema.plugin(mongoosePaginate);
locationSchema.plugin(aggregatePaginate);

const LocationModel = model("Location", locationSchema);

module.exports = LocationModel;
