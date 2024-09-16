const mongoose = require("mongoose")


exports.getEmployeeScheduleTimePipeline = (employeeId) => [
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
        $match: {
            "employeeDetails._id": mongoose.Types.ObjectId(employeeId)
        }
    },
    {
        $project: {
            totalBreakTime: "$totalBreakTime",
            processTime: "$processTime",
            startTime: "$startTime",
            scheduleTime: "$scheduleDetails.scheduleTime"
        }
    }
]