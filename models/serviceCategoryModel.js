const { getMongoosePaginatedData } = require("../utils");
const ServiceCategoryModel = require("./schemas/serviceCategorySchema");

// add service category
exports.addServiceCategory = (obj) => ServiceCategoryModel.create(obj);

// find service
exports.getServiceCategory = (query) => ServiceCategoryModel.findOne(query);

// // update service
// exports.updateServiceById = (id, obj) => ServiceCategoryModel.findByIdAndUpdate(id, obj, { new: true });

// get all service categories
exports.getServiceCategories = async ({ query, page, limit }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: ServiceCategoryModel,
    query,
    page,
    limit,
  });

  return { serviceCategories: data, pagination };
};

exports.getAllServiceCategories = async ({ query, page, limit, populate }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: ServiceCategoryModel,
    query,
    page,
    limit,
    populate
  });

  // Group data by serviceType
  const groupedData = {};
  data.forEach(category => {
    if (!groupedData[category.serviceType]) {
      groupedData[category.serviceType] = [];
    }
    groupedData[category.serviceType].push(category);
  });

  // Modify the response structure
  const modifiedData = Object.keys(groupedData).map(serviceType => {
    const typeCategories = groupedData[serviceType].map(category => ({
      typeName: category.type,
      services: category.service.map(service => ({
        name: service.name,
        description: service.description,
        // Include other fields as needed
      })),
    }));

    const typeID = groupedData[serviceType].map(category => ({
      serviceType: category.serviceType,
    }));

    const serviceCategoryType = typeID[0];

    return {
      ...serviceCategoryType,
      types: typeCategories,
    };
  });

  return { serviceCategories: modifiedData, pagination };
};


// // delete service by ID
// exports.deleteServiceById = (serviceId) => ServiceCategoryModel.findByIdAndDelete(serviceId);
