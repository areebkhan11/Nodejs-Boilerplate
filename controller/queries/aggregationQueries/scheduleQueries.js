const { SCHEDULE_STATUS } = require("../../../utils/constants");
const mongoose = require("mongoose")

exports.getSchedulesTaskCountsPipeline = (serviceType) => {
    return [
        {
            $match: {
                serviceType: mongoose.Types.ObjectId(serviceType),
                phases: { $exists: true, $ne: [] },
            },
        },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                assigned: { $sum: { $cond: { if: { $eq: ["$status", "Assigned"] }, then: 1, else: 0 } } },
                unassigned: { $sum: { $cond: { if: { $eq: ["$status", "Unassigned"] }, then: 1, else: 0 } } },
                inProgress: { $sum: { $cond: { if: { $eq: ["$status", "In Progress"] }, then: 1, else: 0 } } },
                completed: { $sum: { $cond: { if: { $eq: ["$status", "Completed"] }, then: 1, else: 0 } } },
                delayed: { $sum: { $cond: { if: { $eq: ["$status", "Delayed"] }, then: 1, else: 0 } } },
                notStarted: { $sum: { $cond: { if: { $eq: ["$status", "Not Started"] }, then: 1, else: 0 } } },
            },
        },
    ];
};