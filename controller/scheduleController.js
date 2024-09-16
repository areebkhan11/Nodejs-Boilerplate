const { addSchedule,
    getAllSchedules,
    getSchedule,
    updateInspectionInSchedule,
    updateStatus,
    getScheduleTasks,
    getEmployeeProductivity,
    deleteSchedule,
    getActivityTrends,
    productivityBenchmetrix } = require("../models/scheduleModel");

const { addEmployeeSchedule } = require("../models/employeeScheduleModel")
const { parseBody, generateResponse } = require("../utils");
const { STATUS_CODES, SCHEDULE_STATUS } = require("../utils/constants");
const generateDownload = require("../utils/generateDownload")
// create new schedule
exports.addNewSchedule = async (req, res, next) => {
    const body = parseBody(req.body);
    body.user = req.user.id;

    try {
        const schedule = await addSchedule(body);
        generateResponse(schedule, 'Schedule added successfully', res);
    } catch (error) {
        next(error);
    }
};
// update inspection
exports.updateInspection = async (req, res, next) => {
    const { files } = req;
    if (!files) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Images are required'
    });
    const images = files.map(file => file.path);

    const { scheduleId, phaseId } = req.params;
    const { comment, status } = req.body

    try {
        const schedule = await getSchedule({ _id: scheduleId });
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });
        //status will be changed when inspection started
        const updatedInspectionData = {
            images,
            comment,
            status
        }

        if (images && images.length > 4) {
            return res.status(400).json({ message: 'Images limit exceeded. Maximum allowed: 4' });
        }
        //status will update when all phases are completed
        const updatedSchedule = await updateInspectionInSchedule(scheduleId, phaseId, updatedInspectionData);

        const updatedScheduleWithStatus = await updateStatus(scheduleId, updatedSchedule)

        generateResponse(updatedScheduleWithStatus, 'Inspection updated successfully', res);
    } catch (error) {
        next(error);
    }
};

// get all schedules
exports.fetchAllSchedules = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const filters = [];

    if (req.query?.status) filters.push({ status: req.query.status });
    if (req.query?.employee) filters.push({ employee: req.query.employee });
    if (req.query?.serviceType) filters.push({ serviceType: req.query.serviceType });
    if (req.query?.vin) filters.push({ vin: req.query.vin });
    if (req.query?.scheduleTime) filters.push({ scheduleTime: null });
    if (req.user.role === 'employee') {
        // If the user is a employee, only fetch schedules assigned to them
        filters.push({ employee: req.user.id });
    } else if (req.query?.scheduledBy === 'me') {
        // If the user is not a employee but wants to see schedules scheduled by themselves
        filters.push({ user: req.user.id });
    }


    const query = filters.length > 0 ? { $and: filters } : {};
    const populate = [
        { path: 'employee' },
        { path: 'user' },
        { path: 'serviceType' },
        { path: 'scheduleTime' },
        {
            path: 'vehicle',
            populate: { path: 'make' },
            populate: { path: 'category' }
        },
        { path: 'phases' },
        { path: 'phases.serviceData' },

    ]

    try {
        const data = await getAllSchedules({ query, page, limit, populate });
        if (data?.schedules?.length === 0) {
            generateResponse([], 'No inspection schedules found', res);
            return;
        }

        generateResponse(data, 'Inspection schedules fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

// mark schedule as completed
exports.markedAsCompleted = async (req, res, next) => {
    const { scheduleId } = req.params;

    try {
        const schedule = await getSchedule({ _id: scheduleId, markedAsComplete: false });
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });

        schedule.markedAsComplete = true;
        schedule.status = SCHEDULE_STATUS.DONE;
        await schedule.save();

        generateResponse(schedule, 'Schedule marked as completed successfully', res);
    } catch (error) {
        next(error);
    }
}

// schedule is started 
exports.updateIsStarted = async (req, res, next) => {
    const { scheduleId } = req.params;
    const { isStarted } = req.body;
    try {
        const schedule = await getSchedule({ _id: scheduleId });
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });

        schedule.isStarted = isStarted;
        await schedule.save();

        generateResponse(schedule, 'Schedule is successfully started', res);
    } catch (error) {
        next(error);
    }
}

// fetch schedule
exports.fetchSchedule = async (req, res, next) => {
    const { scheduleId } = req.params;

    try {
        const schedule = await getSchedule({ _id: scheduleId })
            .populate('user employee vehicle serviceType phases.serviceData')

        // throw error if schedule not found
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });

        generateResponse(schedule, 'Inspection schedule fetched successfully', res);
    } catch (error) {
        next(error);
    }
}


exports.fetchAllEmployees = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    const filters = [];

    filters.push({ scheduleTime: null });

    const query = filters.length > 0 ? { $and: filters } : {};
    const populate = [
        { path: 'employee' },
    ]

    try {
        const data = await getAllSchedules({ query, page, limit, populate });
        if (data?.schedules?.length === 0) {
            generateResponse([], 'No inspection schedules found', res);
            return;
        }

        const filteredData = Array.from(new Set(data.schedules.map(e => JSON.stringify(e.employee))))
            .map(employeeStr => JSON.parse(employeeStr));

        generateResponse(filteredData, 'Inspection schedules fetched successfully', res);

    } catch (error) {
        next(error);
    }
}

exports.deleteSchedule = async (req, res, next) => {
    const { scheduleId } = req.params;

    try {
        const schedule = await getSchedule({ _id: scheduleId });
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });

        const deletedSchedule = await deleteSchedule({ _id: scheduleId })

        generateResponse(deletedSchedule, 'Schedule deleted successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.assignToDriver = async (req, res, next) => {
    const { employee } = parseBody(req.body);
    const { scheduleId } = req.params;

    try {
        const schedule = await getSchedule({ _id: scheduleId });
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });

        schedule.employee = employee;
        await schedule.save();

        generateResponse(schedule, 'Inspection schedule assigned to employee successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.addShiftTime = async (req, res, next) => {
    const { scheduleTime } = parseBody(req.body);
    const { scheduleId } = req.params;

    try {
        const schedule = await getSchedule({ _id: scheduleId });
        if (!schedule) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection schedule not found'
        });


        schedule.scheduleTime = scheduleTime;
        await schedule.save();
        //adding in employee schedule model
        await addEmployeeSchedule({ schedule: scheduleId });

        generateResponse(schedule, 'Inspection schedule time assigned to employee successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.taskCounts = async (req, res, next) => {

    const { serviceType } = req.query;

    try {
        // Use the aggregation pipeline
        const result = await getScheduleTasks(serviceType);
        // throw error if schedule not found
        if (!result) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'results not found'
        });

        generateResponse(result, "fetch success", res);
    } catch (error) {
        next(error);
    }
}

exports.downloadActivity = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    const filters = [];
    const { startDate, endDate } = req.body
    if (req.body?._id) filters.push({ _id: req.body?._id });
    if (req.body?.serviceType) filters.push({ serviceType: req.body?.serviceType });
    if (startDate, endDate) filters.push({
        createdAt: {
            $gte: startDate,
            $lt: endDate
        }
    });
    const query = filters.length > 0 ? { $and: filters } : {};
    const populate = [
        { path: 'employee' },
        { path: 'user' },
        { path: 'serviceType' },
        {
            path: 'vehicle',
            populate: { path: 'make' },
            populate: { path: 'category' }
        },
        { path: 'phases' },
        { path: 'phases.serviceData' },
    ];

    const activityFields = [
        { id: 'employee', label: 'Employee', getValue: activity => activity.employee.firstName },
        { id: 'vehicle', label: 'Vehicle', getValue: activity => activity.vehicle.name },
        { id: 'serviceType', label: 'Service Type', getValue: activity => activity.serviceType.name },
        { id: 'status', label: 'Status', getValue: activity => activity.status },
        { id: 'lastPerform', label: 'Last Perform', getValue: activity => activity.updatedAt.toString().slice(0, 15) },
        { id: 'location', label: 'Location', getValue: activity => activity.location.address }
    ];

    try {
        const { format } = req.body;

        const data = await getAllSchedules({ query, page, limit, populate });
        if (data?.schedules?.length === 0) {
            generateResponse([], 'No inspection schedules found', res);
            return;
        }
        await generateDownload(data, format, res, activityFields);
    } catch (error) {
        next(error);
    }
}

exports.fetchEmployeeProductivity = async (req, res, next) => {

    const { serviceType, monthYear } = req.query;

    // Validate query parameters
    if (!serviceType || !monthYear || monthYear.length !== 6) {
        return res.status(400).json({ error: 'Invalid monthYear parameter.' });
    }

    // Extract month and year from the combined input
    const year = parseInt(monthYear.substring(0, 4));
    const month = parseInt(monthYear.substring(4, 6));

    // Check if the month and year are valid
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
        return res.status(400).json({ error: 'Invalid month or year.' });
    }

    // Convert month and year to Date objects
    const startDate = new Date(year, month, 1);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() - 2);
    endDate.setDate(0);


    try {
        // Use the aggregation pipeline
        const result = await getEmployeeProductivity(serviceType, startDate, endDate)

        generateResponse(result, "fetch success", res);
    } catch (error) {
        next(error);
    }
}

exports.fetchActivityTrends = async (req, res, next) => {
    const { serviceType, year } = req.query;

    if (!serviceType) {
        return res.status(400).json({ error: 'serviceType is required parameter.' });
    }
    let endYear = Number(year) + 1;
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${endYear}-01-01T00:00:00.000Z`);

    try {
        const result = await getActivityTrends(serviceType, startDate, endDate);

        generateResponse(result, "fetch success", res);

    } catch (error) {
        next(error);
    }

}

exports.fetchProductivityBenchmetrix = async (req, res, next) => {
    const { serviceType, date } = req.query;

    if (!serviceType) {
        return res.status(400).json({ error: 'serviceType is required parameter.' });
    }

    const startDate = new Date(date);
    const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);

    try {
        const result = await productivityBenchmetrix(serviceType, startDate, endDate);

        generateResponse(result, "fetch success", res);

    } catch (error) {
        next(error);
    }

}