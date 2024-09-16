const serviceCategoryTypeSchema = require("./schemas/serviceCategoryTypeSchema");

// add service category options
exports.addServiceTypes = (obj) => serviceCategoryTypeSchema.create(obj);

// add / update service category options
// exports.addServiceCategoryOptions = (obj) => serviceCategoryTypeSchema.findOneAndUpdate({ category: obj.category }, obj, { upsert: true, new: true });

// find service category options by ID
exports.getServiceTypes = (query) => serviceCategoryTypeSchema.find(query);

// get all types
exports.getAllServiceTypes = () => serviceCategoryTypeSchema.find();