const mongoose = require("mongoose")


exports.getEmployeeProcessTimePipeline = (startDate, employeeId) => {
    let matchStage = {
        $match: {}
    };

    if (startDate) {
        matchStage.$match.$or = [{
            "scheduleDetails.scheduleTime": {
                $gte: new Date(startDate),
            }
        }];
    }
    if (employeeId) {
        if (!matchStage.$match.$or) {
            matchStage.$match.$or = [];
        }
        matchStage.$match.$or.push({
            "employeeDetails._id": mongoose.Types.ObjectId(employeeId)
        });
    }
    return (
        [
            {
                $lookup: {
                    from: "schedules",
                    localField: "schedule",
                    foreignField: "_id",
                    as: "scheduleDetails",
                },
            },
            {
                $unwind: {
                    path: "$scheduleDetails",
                },
            },

            {
                $lookup: {
                    from: "users",
                    localField: "scheduleDetails.employee",
                    foreignField: "_id",
                    as: "employeeDetails",
                },
            },
            {
                $unwind: {
                    path: "$employeeDetails",
                },
            },
            matchStage,
            {
                $project: {
                    startTime: 1,
                    endTime: 1,
                    break: 1,
                    processTime: 1,
                    breakStartTime: 1,
                    totalBreakTime: 1,
                    "scheduleDetails.user": 1,
                    "scheduleDetails.employee": 1,
                    "employeeDetails.firstName": 1,
                    "employeeDetails.lastName": 1,
                    "employeeDetails.email": 1,
                    "employeeDetails._id": 1,
                    "scheduleDetails.scheduleTime": 1,
                },
            },
            {
                $group: {
                    _id: {
                        employee: "$employeeDetails",
                        dayOfWeek: {
                            $dayOfWeek: "$scheduleDetails.scheduleTime",
                        },
                    },
                    totalStartTime: {
                        $min: "$startTime",
                    },
                    totalEndTime: {
                        $max: "$endTime",
                    },
                    totalBreakTime: {
                        $sum: "$totalBreakTime",
                    },
                },
            },
            {
                $project: {
                    _id: 0,
                    employee: "$_id.employee",
                    dayOfWeek: "$_id.dayOfWeek",
                    totalStartTime: 1,
                    totalEndTime: 1,
                    totalBreakTime: 1,
                },
            },
            {
                $group: {
                    _id: "$employee",
                    weekDetails: {
                        $push: {
                            dayOfWeek: "$dayOfWeek",
                            totalStartTime: "$totalStartTime",
                            totalEndTime: "$totalEndTime",
                            totalBreakTime: "$totalBreakTime",
                        },
                    },
                },
            },
        ]

    )
};