const { getMongoosePaginatedData } = require("../utils");
const VehicleModel = require("./schemas/vehicleSchema");

// create vehicle
exports.createVehicle = (obj) => {
  return VehicleModel.create(obj)
      
};

// get vehicle
exports.getVehicle = (query) => VehicleModel.findOne(query).populate({ path: "category", select: "name" })
.populate({ path: "type", select: "vehicletype" })
.populate({path:"make", select:"manufacturer"})
.populate({path:"fuelType", select:"fuelType"});

// update vehicle
exports.updateVehicle = (query, obj) => VehicleModel.findOneAndUpdate(query, obj, { new: true });

// get all vehicles
exports.getAllVehicles = async ({ query, page, limit }) => {
  const { data, pagination } = await getMongoosePaginatedData({
    model: VehicleModel,
    query,
    page,
    limit,
    sort: { name: 1 },
    populate: [
      { path: 'category', select: 'name' },
      {path:"fuelType", select:"fuelType"},
      { path: "type", select: "vehicletype" },
      {path:"make", select:"manufacturer"}

    ]
  });

  return { vehicles: data, pagination };
};

// get vehicle by vin
exports.getVehicleByVin = (vin) => VehicleModel.findOne({ vin });

// delete vehicle
exports.deleteVehicleById = (vehicleId) => VehicleModel.findByIdAndUpdate(vehicleId, { isDeleted: true }, { new: true });;

// get vehicles
exports.getVehicles = (query) => VehicleModel.find(query);