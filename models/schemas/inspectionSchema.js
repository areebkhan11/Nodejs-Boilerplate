const { Schema, model, SchemaType } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const inspectionSchema = new Schema({
    vehicleID: { type: Schema.Types.ObjectId, ref: 'Vehicle' },//ref id
    images: { type: [String], default: [] },
    isDeleted: { type: Boolean, default: false },
    details: { type: String, default: null },
    notes: { type: String, default: null },
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    vin: { type: String, default: null },

}, { timestamps: true, versionKey: false });

inspectionSchema.plugin(mongoosePaginate);
inspectionSchema.plugin(aggregatePaginate);

const InspectionModel = model('InspectionRecord', inspectionSchema);
module.exports = InspectionModel;