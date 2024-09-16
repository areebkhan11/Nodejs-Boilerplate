const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const ServiceTypeSchema = new Schema({
    name: { type: String },
}, { timestamps: true, versionKey: false });

ServiceTypeSchema.plugin(mongoosePaginate);
ServiceTypeSchema.plugin(aggregatePaginate);

const serviceCategoryTypeSchema = model('ServiceType', ServiceTypeSchema);

module.exports = serviceCategoryTypeSchema;