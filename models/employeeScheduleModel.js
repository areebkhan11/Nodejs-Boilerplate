const { getMongoosePaginatedData, getMongooseAggregatePaginatedData } = require("../utils");
const EmployeeScheduleModel = require("./schemas/employeeSchedule");


// add employee schedule 
exports.addEmployeeSchedule = (obj) => EmployeeScheduleModel.create(obj);

//get all employee schedules
exports.getEmployeeSchedule = async ({ query, page, limit, populate }) => {
    const { data, pagination } = await getMongoosePaginatedData({
        model: EmployeeScheduleModel,
        query,
        page,
        limit,
        populate,
    });

    return { schedules: data, pagination };
};