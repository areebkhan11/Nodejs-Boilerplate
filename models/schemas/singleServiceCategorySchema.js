const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { SERVICE_DATA_STATUS } = require("../../utils/constants");

const singleServiceCategorySchema = new Schema({
    name: { type: String },
    description: { type: String },
    serviceCategory: { type: Schema.Types.ObjectId, ref: 'ServiceCategory' },
}, { timestamps: true, versionKey: false });

singleServiceCategorySchema.plugin(mongoosePaginate);
singleServiceCategorySchema.plugin(aggregatePaginate);


// Add a post hook to update the ServiceCategoryModel

singleServiceCategorySchema.post('save', async function (doc) {
    // Get the ServiceCategoryModel
    const ServiceCategoryModel = require('./serviceCategorySchema');

    // Find the ServiceCategoryModel document by its ID
    const serviceCategory = await ServiceCategoryModel.findById(doc.serviceCategory);

    // Create a new service object with name, description, and the _id of the singleServiceCategory document
    const newService = {
        _id: doc._id,
        name: doc.name,
        description: doc.description,
        serviceCategory: doc.serviceCategory
    };

    // Add the new service object to the service array
    serviceCategory.service.push(newService);

    // Save the updated ServiceCategoryModel document
    await serviceCategory.save();
});

const singleServiceCategoryModel = model('SingleServiceCategory', singleServiceCategorySchema);

module.exports = singleServiceCategoryModel;