const singleServiceCategoryModel = require("./schemas/singleServiceCategorySchema")

// add service category options
exports.addSingleServiceCategory = (obj) => singleServiceCategoryModel.create(obj);

// add / update service category options
// exports.addServiceCategoryOptions = (obj) => serviceCategoryTypeSchema.findOneAndUpdate({ category: obj.category }, obj, { upsert: true, new: true });

// find service category options by ID
// exports.getServiceTypes = (query) => serviceCategoryTypeSchema.find(query);

// // get all types
// exports.getAllServiceTypes = () => serviceCategoryTypeSchema.find();