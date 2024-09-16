const { addShift, findById, findAll, getFilteredShifts } = require('../models/shiftModel');
const { generateResponse, parseBody } = require('../utils');
const { STATUS_CODES } = require('../utils/constants');
const moment = require('moment');


exports.addShift = async (req, res, next) => {
    const body = parseBody(req.body);
    try {
        const shift = await addShift(body);
        generateResponse(shift, 'Shift  Started', res);
    } catch (error) {
        next(error);
    }
}

// update shift
exports.updateShift = async (req, res, next) => {
    const { id } = req.params;
    const {
        startShift,
        endReportingTime,
        endShift,
        firstBreakStart,
        firstBreakEnd,
        lunchStart,
        lunchEnd,
        secondBreakStart,
        secondBreakEnd,
    } = req.body;

    try {
        const shift = await findById(id);
        // Update shift fields with frontend data
        if (startShift) shift.startShift = moment(startShift);
        if (endReportingTime) shift.reportingTime.end = moment(endReportingTime);
        if (endShift) shift.endShift = moment(endShift);
        if (firstBreakStart) shift.firstBreak.start = moment(firstBreakStart);
        if (firstBreakEnd) shift.firstBreak.end = moment(firstBreakEnd);
        if (lunchStart) shift.lunch.start = moment(lunchStart);
        if (lunchEnd) shift.lunch.end = moment(lunchEnd);
        if (secondBreakStart) shift.secondBreak.start = moment(secondBreakStart);
        if (secondBreakEnd) shift.secondBreak.end = moment(secondBreakEnd);

        // Calculate work hours
        if (endReportingTime) {
            const startRT = moment(shift.reportingTime.start);
            const endRT = moment(endReportingTime);
            shift.reportingTime.total = endRT.diff(startRT);
        }

        let totalWorkHours = 0;
        if (endShift) {
            const startShft = moment(shift.startShift);
            const endShft = moment(endShift);
            totalWorkHours = endShft.diff(startShft);
        }

        const totalWorkTime = shift.reportingTime.total + totalWorkHours;

        // Calculate break hours
        if (firstBreakEnd) {
            shift.firstBreak.total = moment(firstBreakEnd).diff(shift.firstBreak.start);
        }
        if (lunchEnd) {
            shift.lunch.total = moment(lunchEnd).diff(shift.lunch.start);
        }
        if (secondBreakEnd) {
            shift.secondBreak.total = moment(secondBreakEnd).diff(shift.secondBreak.start);
        }

        // Update total work and break hours for the day
        shift.totalBreak = shift.firstBreak.total + shift.lunch.total + shift.secondBreak.total;
        shift.workHours = totalWorkTime - shift.totalBreak

        // You would need to implement the logic to calculate weekTotal based on accumulated work and break hours for the week
        // This might involve querying for shifts within the current week and summing up their work and break times

        // Save the updated shift
        const updatedShift = await shift.save();

        generateResponse(updatedShift, 'Shift Updated', res);
    } catch (error) {
        next(error);
    }
};

exports.getTodayShifts = async (req, res, next) => {
    try {
        // Call the model function to get tasks
        const shifts = await findAll();
        if (!shifts) {
            return generateResponse(null, 'No Shifts Found', res);
        }

        generateResponse(shifts, 'Shifts Found', res);

    } catch (error) {
        next(error);
    }
}

// get all shifts
exports.getAllShifts = async (req, res, next) => {
    {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
        const endDate = req.query.endDate ? new Date(req.query.endDate) : null;
        if (startDate && endDate && endDate < startDate) {
            return generateResponse(null, 'End date must be greater than start date', res);
        }

        const filters = [];
        filters.push({ user: req.user.id });
        filters.push({ createdAt: { $gte: startDate, $lte: endDate } });

        const query = filters.length > 0 ? { $and: filters } : {};
        try {
            const data = await getFilteredShifts({ query, page, limit });
            if (data?.shifts?.length === 0) {
                generateResponse(null, 'No items found', res);
                return;
            }

            generateResponse(data, 'Items fetched successfully', res);
        } catch (error) {
            next(error);
        }
    }

}