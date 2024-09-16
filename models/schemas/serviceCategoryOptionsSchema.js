const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const optionSchema = new Schema({
    name: { type: String },
}, { timestamps: false, versionKey: false });

const serviceCategoryOptionsSchema = new Schema({
    category: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
    title: { type: String },
    type: { type: String, enum: ['checkbox', 'radio', 'input'], default: 'checkbox' },
    options: [optionSchema],
}, { timestamps: false, versionKey: false });

serviceCategoryOptionsSchema.plugin(mongoosePaginate);
serviceCategoryOptionsSchema.plugin(aggregatePaginate);

const ServiceCategoryOptionsModel = model('ServiceCategoryOption', serviceCategoryOptionsSchema);

module.exports = ServiceCategoryOptionsModel;