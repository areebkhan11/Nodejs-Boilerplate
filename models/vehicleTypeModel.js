const { getMongoosePaginatedData } = require("../utils");
const VehicleModel = require("./schemas/vehicleTypeSchema");

//Add vehicle type
exports.createVehicleType = (obj) => VehicleModel.create(obj);

//Get vehicle type
exports.getVehicleType = (query) => VehicleModel.findOne(query);

//update vehicle type
exports.updateVehicleType = (query, obj) => VehicleModel.findOneAndUpdate(query, obj, { new: true });

//get all vehicle types
exports.getAllVehicleTypes = async ({ query, page, limit }) => {
    const { data, pagination } = await getMongoosePaginatedData({
        model: VehicleModel,
        query,
        page,
        limit,
    });
    return { vehicleTypes: data, pagination };
};

//delete vehicle type
exports.deleteVehicleType = (vehicleTypeId) => VehicleModel.findByIdAndUpdate(vehicleTypeId, { isDeleted: true }, { new: true });

