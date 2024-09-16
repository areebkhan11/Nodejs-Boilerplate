const ServiceCategoryOptionsModel = require("./schemas/serviceCategoryOptionsSchema");

// add service category options
exports.addServiceCategoryOptions = (obj) => ServiceCategoryOptionsModel.create(obj);

// add / update service category options
// exports.addServiceCategoryOptions = (obj) => ServiceCategoryOptionsModel.findOneAndUpdate({ category: obj.category }, obj, { upsert: true, new: true });

// find service category options by ID
exports.getServiceCategoryOptions = (query) => ServiceCategoryOptionsModel.find(query);
