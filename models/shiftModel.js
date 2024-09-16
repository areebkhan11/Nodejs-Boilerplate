const ShiftModel = require('./schemas/shiftSchema');
const { getMongoosePaginatedData } = require("../utils");

// start shift
exports.addShift = (obj) => ShiftModel.create(obj);


//find single shift
exports.findById = (id) => ShiftModel.findById(id);

// find all todays shift
exports.findAll = async () => {
    const today = new Date();
    // Set the time to the beginning of the day (midnight)
    today.setHours(0, 0, 0, 0);

    // Query for documents created today
    const shifts = await ShiftModel.find({ createdAt: { $gte: today, $lt: new Date(today.getTime() + 86400000) } });
    const AllUserShifts = await ShiftModel.populate(shifts, [
        { path: "user" },
    ]);
    return AllUserShifts;

};


exports.findUserShift = async (userId) => {
    const today = new Date();
    // Set the time to the beginning of the day (midnight)
    today.setHours(0, 0, 0, 0);

    // Query for documents created today
    return await ShiftModel.find({ user: userId, createdAt: { $gte: today, $lte: new Date(today.getTime() + 86400000) } });
}

// find shift for a user and a date
exports.getFilteredShifts = async ({ query, page, limit }) => {
    const { data, pagination } = await getMongoosePaginatedData({
        model: ShiftModel,
        query,
        page,
        limit,
    });

    return { shifts: data, pagination };
};

exports.findShiftForUserAndDate = async (userId, date) => {
    // Find a shift entry for the specified user ID and date
    return await ShiftModel.findOne({ user: userId, 'reportingTime.start': { $gte: date, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) } });
}