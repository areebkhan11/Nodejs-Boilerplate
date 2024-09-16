const { getMongoosePaginatedData } = require("../utils");
const MakeModel = require("./schemas/makeSchema");

// add vehicle make
exports.createMake = (obj) => MakeModel.create(obj);

// get vehicle make
exports.getMakeById = (id) => MakeModel.findById(id);

// update vehicle make
exports.updateMakeById = (id, obj) => MakeModel.findByIdAndUpdate(id, obj, { new: true });

// get all makes
exports.getAllMakes = async ({ query, page, limit }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: MakeModel,
    query,
    page,
    limit
  });

  return { makes: data, pagination };
};

// delete vehicle make
exports.deleteVehicleMakeById = (vehicleId) => MakeModel.findByIdAndUpdate(vehicleId, { isDeleted: true }, { new: true });;

// get vehicles
exports.getMakes = (query) => MakeModel.find(query);

// get vehicles by manufacturer
exports.getMakesByManufacturer = (query) => MakeModel.findOne(query);