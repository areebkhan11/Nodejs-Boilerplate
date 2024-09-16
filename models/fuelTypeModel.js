const { getMongoosePaginatedData } = require("../utils");
const FuelModel = require("./schemas/fuelTypeSchema");

// add fuel type
exports.createFuel = (obj) => FuelModel.create(obj);

// get fuels
exports.getFuels = (query) => FuelModel.find(query);

// get fuels by name
exports.getFuelsByName = (obj) => FuelModel.findOne(obj);

// get fuel type by ID
exports.getFuelById = (id) => FuelModel.findById(id);

// update fuel type by ID
exports.updateFuelById = (id, obj) => FuelModel.findByIdAndUpdate(id, obj, { new: true });

// get all fuel types
exports.getAllFuels = async ({ query, page, limit }) => {
    const { data, pagination } = await getMongoosePaginatedData({
        model: FuelModel,
        query,
        page,
        limit
    });

    return { fuels: data, pagination };
};

// delete fuel type by ID
exports.deleteFuelById = (fuelId) => FuelModel.findByIdAndUpdate(fuelId, { isDeleted: true }, { new: true });

// get fuels
