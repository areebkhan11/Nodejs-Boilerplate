const { getMongoosePaginatedData } = require("../utils");
const TaskDetailModel = require("./schemas/taskDetailSchema");

// add initiated task
exports.addInitiatedTasksWithCount = async (userId, tasksCount, totalInitialTasks) => {
    try {
        // Check if a document with the specified userId exists
        const existingTask = await TaskDetailModel.findOne({ userId });

        if (existingTask) {
            // If the document exists, update the count of taskInitiate
            existingTask.taskInitiate = totalInitialTasks;
            existingTask.taskComplete = tasksCount;
            await existingTask.save();
            return 'Task count updated';
        } else {
            // If the document doesn't exist, create a new one with the specified count
            const task = {
                user: userId,
                taskComplete: tasksCount,
                taskInitiate: totalInitialTasks,
                // Add other necessary fields for the task
            };
            await TaskDetailModel.create(task);
            return 'Task created with count and taskInitiate key';
        }
    } catch (error) {
        throw error;
    }
};

// get all tasks by user id and today's date
exports.getAllTasksByUserIdandTodaydate = async (userId, startDate, endDate) => {
    try {
        const tasks = await TaskDetailModel.find({
            user: userId,
            created_at: {
                $gte: startDate,
                $lt: endDate
            },
        });

        // Initialize variables to store total taskComplete and total taskInitiate
        let totalTaskComplete = 0;
        let totalTaskInitiate = 0;

        // Iterate through each task object in the tasks array
        tasks.forEach(task => {
            // Add taskComplete and taskInitiate from each task object to the totals
            totalTaskComplete += task.taskComplete || 0; // Add 0 if taskComplete is undefined
            totalTaskInitiate += task.taskInitiate || 0; // Add 0 if taskInitiate is undefined
        });

        // Log the totals
        console.log(totalTaskComplete, "Total Task Complete");
        console.log(totalTaskInitiate, "Total Task Initiate");

        // Return the totals
        return { totalTaskComplete, totalTaskInitiate };
    } catch (error) {
        throw error;
    }
}




