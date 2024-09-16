const { getMongoosePaginatedData } = require("../utils");
const VehicleCategoryModel = require("./schemas/vehicleCategorySchema");

// create category
exports.createCategory = (obj) => VehicleCategoryModel.create(obj);

// find category
exports.getCategory = (query) => VehicleCategoryModel.findOne(query);

// update category
exports.updateCategory = (query, obj) => VehicleCategoryModel.findOneAndUpdate(query, obj, { new: true });

// get all categories
exports.getAllCategories = async ({ query, page, limit }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: VehicleCategoryModel,
    query,
    page,
    limit,
  });

  return { categories: data, pagination };
};

// delete category (soft delete)
exports.deleteCategory = (categoryId) => VehicleCategoryModel.findByIdAndUpdate(categoryId, { $set: { isDeleted: true } }, { new: true });
