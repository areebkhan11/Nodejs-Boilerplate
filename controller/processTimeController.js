

const { STATUS_CODES } = require("../utils/constants");
const { getProcessTimeDetails, getAllProcessTimes, getProcessTime } = require("../models/processTimeModel");
const { generateResponse } = require("../utils");
const { getEmployeeProcessTimePipeline } = require('./queries/aggregationQueries/processTimeQuries');
const { getEmployeeScheduleTimePipeline } = require('./queries/aggregationQueries/employeeScheduleTimeQuery');
const pdfkit = require('pdfkit');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;


exports.getProcessTimes = async (req, res, next) => {
    let { startDate, employeeId } = req.query;
    try {
        const processTimes = await getAllProcessTimes();
        if (!processTimes) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'process Time not found'
        });
        const query = getEmployeeProcessTimePipeline(startDate, employeeId);
        const data = await getProcessTimeDetails(query);

        generateResponse(data, 'Process time details fetch success', res);
    } catch (error) {
        next(error);
    }
}

exports.downloadEmployeeSchedule = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;

    const { startDate, employeeId } = req.query;


    try {
        const { format } = req.body;

        const query = getEmployeeProcessTimePipeline(startDate, employeeId);
        const data = await getProcessTimeDetails(query);
        if (data?.length === 0) {
            generateResponse([], 'No inspection schedules found', res);
            return;
        }
        if (format === 'pdf') {
            // Generate PDF
            const pdfDoc = new pdfkit();
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=activity_details.pdf');
            pdfDoc.pipe(res);
            pdfDoc.fontSize(14).text('Fleet Service Activity Details', { align: 'center' });


            try {

                data?.forEach(activity => {
                    pdfDoc
                        .fontSize(12)
                        // .text(`Date: ${activity.date}`, { continued: true })
                        .text(`Employee: ${activity._id.firstName} | `, { continued: true })
                        .text(`dayOfWeek: ${activity.weekDetails[0].dayOfWeek} | `, { continued: true })
                        .text(`totalStartTime: ${activity.weekDetails[0].totalStartTime} | `, { continued: true })
                        .text(`totalEndTime: ${activity.weekDetails[0].totalEndTime} | `, { continued: true })
                        .text(`totalBreakTime: ${activity.weekDetails[0].totalBreakTime} | `, { continued: true })

                        .moveDown();
                });
                pdfDoc.end();

            } catch (error) {
                console.error('Error generating PDF:', error);
                res.status(500).json({ success: false, error: 'Error generating PDF' });
            } finally {
                console.log('Closing PDF stream.');
            }
        } else if (format === 'csv') {
            // Generate CSV
            const csvData = data.schedules.map(activity => ({
                field1: activity.vehicle.name,
                field2: activity.serviceType.name,
                field3: activity.status,
            }));


            const csvWriter = createCsvWriter({
                path: 'activity_details.csv',
                header: [
                    // Define your CSV headers based on data
                    { id: 'field1', title: 'Vehicle' },
                    { id: 'field2', title: 'Service Type' },
                    { id: 'field3', title: 'Status' },

                ],
            });

            // Write csvData data to CSV
            csvWriter.writeRecords(csvData)
                .then(() => {
                    res.setHeader('Content-Type', 'text/csv');
                    res.setHeader('Content-Disposition', 'attachment; filename=activity_details.csv');
                    res.download('activity_details.csv');
                });
        } else {
            res.status(400).json({ success: false, error: 'Invalid format specified' });
        }


        // generateResponse(data, 'download successful', res);
    } catch (error) {
        next(error);
    }
}

exports.getEmployeeSchedule = async (req, res, next) => {
    const employeeId = req.user.id;

    try {
        const query = getEmployeeScheduleTimePipeline(employeeId);
        const processTimes = await getProcessTimeDetails(query);
        if (!processTimes) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'process Time not found'
        });


        generateResponse(processTimes, 'Process time details fetch success', res);
    } catch (error) {
        next(error);
    }
}