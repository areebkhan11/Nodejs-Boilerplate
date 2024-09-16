const { addInitiatedTasksWithCount, getAllTasksByUserIdandTodaydate } = require('../models/taskdetailModel');
const { generateResponse, parseBody } = require("../utils");
const { STATUS } = require('../utils/constants');

exports.saveAllTasksForToday = async (req, res, next) => {
    const userId = req.user.id;
    const today = new Date();
    const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ); // Start of today
    const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
    );

    try {
        // Get the count of tasks for today
        const { tasksCount } = await getAllTasksByUserIdandTodaydate(userId, startDate, endDate);

        // Save the count and update taskInitiate key for each task
        await addInitiatedTasksWithCount(userId, tasksCount);

        generateResponse({ tasksCount }, 'All tasks for today saved successfully', res);
    } catch (error) {
        next(error);
    }
}


exports.getTasksCount = async (req, res) => {
    const userId = req.user.id;
    const today = new Date();
    const startDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    ); // Start of today
    const endDate = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() + 1
    );
    try {
        // Call the model function to get tasks
        const { totalTaskComplete, totalTaskInitiate } = await getAllTasksByUserIdandTodaydate(userId, startDate, endDate);

        // Send the response with the tasks count and total initial tasks
        res.status(200).json({ totalTaskInitiate, totalTaskComplete });
    } catch (error) {
        // If an error occurs, send an error response
        console.error("Error in fetching tasks:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};




