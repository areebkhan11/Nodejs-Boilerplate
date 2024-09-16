const { getMongoosePaginatedData, getMongooseAggregatePaginatedData } = require("../utils");
const ScheduleModel = require("./schemas/scheduleSchema");
const { SCHEDULE_STATUS } = require("../utils/constants");
const UserModel = require("./schemas/userSchema");
const { getSchedulesTaskCountsPipeline } = require('../controller/queries/aggregationQueries/scheduleQueries');
const mongoose = require("mongoose")

// add schedule
exports.addSchedule = (obj) => ScheduleModel.create(obj);

// get all schedules
exports.getAllSchedules = async ({ query, page, limit, populate }) => {
    const { data, pagination } = await getMongoosePaginatedData({
        model: ScheduleModel,
        query,
        page,
        limit,
        populate,
    });

    return { schedules: data, pagination };
};

// get all schedules
exports.getAllReportSchedules = async ({ query, populate }) => {
    const { data } = await getMongoosePaginatedData({
        model: ScheduleModel,
        query,
        populate
    });

    return { schedules: data };
};

// get schedule
exports.getSchedule = (query) => ScheduleModel.findOne(query);

exports.deleteSchedule = (query) => ScheduleModel.deleteOne(query);

//get tasks
exports.getScheduleTasks = async (serviceType) => {
    if (!serviceType) {
        throw new Error('serviceType not found');
    }
    const aggregationPipeline = getSchedulesTaskCountsPipeline(serviceType);
    const result = await ScheduleModel.aggregate(aggregationPipeline);
    return result
};

exports.getEmployeeProductivity = async (serviceType, startDate, endDate) => {
    if (!serviceType) {
        throw new Error('serviceType not found');
    }

    const query = [
        {
            $match: {
                serviceType: mongoose.Types.ObjectId(serviceType),
                createdAt: {
                    $lte: startDate,
                    $gte: endDate
                },
                status: "Completed"
            },
        },
        {
            $unwind: "$phases",
        },
        {
            $match: {
                "phases.status": { $in: ["Pass", "Fail"] },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "employee",
                foreignField: "_id",
                as: "employee",
            },
        },
        {
            $unwind: "$employee",
        },
        {
            $group: {
                _id: {
                    serviceType: "$serviceType",
                    employeeId: "$employee._id",
                },
                employeeName: {
                    $first: {
                        $concat: [
                            "$employee.firstName",
                            " ",
                            "$employee.lastName",
                        ],
                    },
                },
                totalTasks: {
                    $sum: 1,
                },
            },
        },
        {
            $group: {
                _id: "$_id.serviceType",
                employeeData: {
                    $push: {
                        employeeName: "$employeeName",
                        totalTasks: "$totalTasks",
                    },
                },
            },
        },
        {
            $project: {
                _id: 0,
                serviceType: "$_id",
                employeeData: 1,
            },
        },
        {
            $unwind: "$employeeData"
        },
        {
            $sort: {
                "employeeData.totalTasks": -1
            }
        },
        {
            $group: {
                _id: "$serviceType",
                employeeData: {
                    $push: "$employeeData"
                }
            }
        },
        {
            $project: {
                _id: 0,
                serviceType: "$_id",
                employeeData: { $slice: ["$employeeData", 10] }
            }
        }
    ]

    const result = await ScheduleModel.aggregate(query);

    return result

};

exports.getActivityTrends = async (serviceType, startDate, endDate) => {

    const query = [
        {
            $match: {
                serviceType: mongoose.Types.ObjectId(serviceType),
                phases: { $exists: true, $ne: [] },
                createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
            $unwind: '$phases',
        },
        {
            $addFields: {
                month: { $month: '$createdAt' },
                year: { $year: '$createdAt' },
            },
        },
        {
            $group: {
                _id: {
                    month: '$month',
                    year: '$year',
                },
                totalServices: { $sum: 1 },
            },
        },
        {
            $sort: {
                '_id.year': 1,
                '_id.month': 1,
            },
        },
        {
            $project: {
                _id: 0,
                month: '$_id.month',
                year: '$_id.year',
                totalServices: 1,
            },
        },
        {
            $group: {
                _id: null,
                monthlyServiceCounts: { $push: '$$ROOT' },
            },
        },
        {
            $project: {
                _id: 0,
                monthlyServiceCounts: 1,
            },
        },
    ];


    const result = await ScheduleModel.aggregate(query);

    return result

}

exports.productivityBenchmetrix = async (serviceType, startDate, endDate) => {

    const query = [
        {
            $match: {
                serviceType: mongoose.Types.ObjectId(serviceType),
                phases: { $exists: true, $ne: [] },
                createdAt: {
                    $gte: startDate,
                    $lt: endDate,
                },
            },
        },
        {
            $unwind: '$phases',
        },
        {
            $addFields: {
                date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                hour: { $hour: '$createdAt' },
            },
        },
        {
            $group: {
                _id: {
                    date: '$date',
                    hour: '$hour',
                },
                totalServices: { $sum: 1 },
            },
        },
        {
            $sort: {
                '_id.date': 1,
                '_id.hour': 1,
            },
        },
        {
            $project: {
                _id: 0,
                date: '$_id.date',
                hour: '$_id.hour',
                totalServices: 1,
            },
        },
        {
            $group: {
                _id: null,
                hourlyServiceCounts: { $push: '$$ROOT' },
            },
        },
        {
            $project: {
                _id: 0,
                hourlyServiceCounts: 1,
            },
        },
    ];

    const result = await ScheduleModel.aggregate(query);

    return result

}
// update phase in schedule
exports.updateInspectionInSchedule = async (scheduleId, inspectionId, updatedData) => {
    const schedule = await ScheduleModel.findOne({ _id: scheduleId });

    if (!schedule) {
        throw new Error('Inspection schedule not found');
    }

    const phaseIndex = schedule.phases.findIndex((phase) => phase._id.toString() === inspectionId);
    if (phaseIndex === -1) {
        throw new Error('Inspection phase not found');
    }

    const phaseToUpdate = schedule.phases[phaseIndex];
    phaseToUpdate.set(updatedData);

    await schedule.save();

    return schedule;
};

exports.updateStatus = async (scheduleId, updatedSchedule) => {
    const schedule = await ScheduleModel.findOne({ _id: scheduleId });

    const statusUpdate = updatedSchedule.phases.filter(phase => phase.status === 'No Status')

    if (statusUpdate.length > 0) {
        schedule.status = SCHEDULE_STATUS.IN_PROGRESS;
        await schedule.save();
    }

    if (statusUpdate.length <= 0) {
        schedule.status = SCHEDULE_STATUS.COMPLETED;
        await schedule.save();
    }

    return schedule
}

exports.getAllUsersBySchedules = async ({ page = 1, limit = 10 } = {}) => {
    try {
        // Query all schedules to get unique user IDs
        const schedules = await ScheduleModel.find({});
        const uniqueUserIds = Array.from(new Set(schedules.map(schedule => schedule.employee)));
        // Query users based on the unique user IDs
        const users = await UserModel.find({ _id: { $in: uniqueUserIds } })
            .skip((page - 1) * limit)
            .limit(limit);

        return users;
    } catch (error) {
        console.error("Error fetching users by schedules:", error);
        throw error;
    }
};

