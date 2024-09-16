const { getMongoosePaginatedData } = require("../utils");
const LocationModel = require("./schemas/locationSchema");

//add location
exports.createLocation = (obj) => LocationModel.create(obj);

//get all locations
exports.getAllLocations = async ({ query, page, limit, populate }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: LocationModel,
    query,
    page,
    limit,
    populate
});
return { locations: data, pagination };
};

//update location
exports.updateLocationById = (id, obj) => LocationModel.findByIdAndUpdate(id, obj, { new: true });

//delete location
exports.deleteLocationById = (locationId) => LocationModel.findByIdAndUpdate(locationId, { isDeleted: true }, { new: true });