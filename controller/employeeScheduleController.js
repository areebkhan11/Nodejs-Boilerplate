

const { getEmployeeSchedule } = require("../models/employeeScheduleModel");
const { generateResponse } = require("../utils");


exports.getAllEmployeeSchedules = async (req, res, next) => {
    // const { startDate } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    const filters = [];

    if (req.query?.employee) filters.push({ employee: req.query.employee });

    const query = filters.length > 0 ? { $and: filters } : {};
    const populate = [
        {
            path: 'schedule',
            populate: ['employee', 'serviceType'],
        }
    ]
    try {
        const data = await getEmployeeSchedule({ query, page, limit, populate });


        generateResponse(data, 'Employee Schedule fetch success', res);
    } catch (error) {
        next(error);
    }

}