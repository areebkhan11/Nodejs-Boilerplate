const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const singleServiceCategorySchema = new Schema({
    name: { type: String },
    description: { type: String },
    serviceCategory: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', default: null },
}, { timestamps: true, versionKey: false });

const serviceCategorySchema = new Schema({
    type: { type: String },
    service: [singleServiceCategorySchema],
    serviceType: { type: Schema.Types.ObjectId, ref: 'ServiceType', default: null },
}, { timestamps: true, versionKey: false });



serviceCategorySchema.plugin(mongoosePaginate);
serviceCategorySchema.plugin(aggregatePaginate);

const ServiceCategoryModel = model('ServiceCategory', serviceCategorySchema);

module.exports = ServiceCategoryModel;