const { getMongoosePaginatedData } = require("../utils");
const InspectionModel = require("./schemas/inspectionSchema");

//add inspection record
exports.createInspection = (obj) => InspectionModel.create(obj);

// get inspection record
exports.getInspectionById = (id) => InspectionModel.findById(id);

//update inspection record
exports.updateInspectionById = (id, obj) => InspectionModel.findByIdAndUpdate(id, obj, { new: true });

//get all inspection records
exports.getAllInspections = async ({ query, page, limit, populate }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: InspectionModel,
    query,
    page,
    limit,
    populate
  });

  return { inspections: data, pagination };
};

//delete inspection record
exports.deleteInspectionById = (inspectionId) => InspectionModel.findByIdAndUpdate(inspectionId, { isDeleted: true }, { new: true });