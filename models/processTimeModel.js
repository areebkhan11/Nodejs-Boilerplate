const ProcessTime = require('./schemas/processTime')
const moment = require('moment')
const { getMongooseAggregatePaginatedData } = require("../utils");


exports.getProcessTime = async (query) => ProcessTime.findOne(query);

exports.getAllProcessTimes = async () => ProcessTime.find();

exports.getProcessTimeDetails = async (query) => {
    const result = await ProcessTime.aggregate(query);
    return result
};

exports.calculateAndUpdateProcessTime = async (scheduleId) => {
    const processTime = await ProcessTime.findOne({ schedule: scheduleId });
    try {
        if (processTime && !processTime.break) {
            // Parse the date strings
            const startTime = moment(processTime.startTime);
            const endTime = moment(processTime.endTime);

            // Calculate the process time duration
            const duration = moment.duration(endTime.diff(startTime));

            // Add duration to startTime
            // const processTimeDate = startTime.clone().add(duration);
            const processTimeDate = duration.asHours();
            // Format the total process time
            // const processTimeStr = processTimeDate.format('YYYY-MM-DDTHH:mm:ss.SSSZ');

            // Update the processTime field in the document
            processTime.processTime = processTimeDate;

            await processTime.save();
            return processTime;
        }

        return processTime;

    } catch (error) {
        throw error;
    }


};