const { createInspection, getInspectionById, updateInspectionById, getAllInspections, deleteInspectionById } = require("../models/inspectionModel");
const { generateResponse, parseBody } = require("../utils");
const { STATUS_CODES } = require("../utils/constants");
const { inspectRecordValidation } = require("../validation/inspectionValidation");


exports.createInspection = async (req, res, next) => {
    const { files } = req;
    if (!files || files.length === 0) {
        return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: 'Images are required'
        });
    }

    const images = files.map(file => file.path);
    const body = {
        ...parseBody(req.body),
        images: images
    };
    body.reportedBy = req.user.id;

    //joi validation
    const { error } = inspectRecordValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const inspection = await createInspection(body);
        generateResponse(inspection, 'Inspection created successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.getInspectionById = async (req, res, next) => {
    const { inspectionId } = req.params;

    try {
        const inspection = await getInspectionById(inspectionId);
        if (!inspection) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection not found'
        });

        generateResponse(inspection, 'Inspection fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.updateInspectionById = async (req, res, next) => {
    const { inspectionId } = req.params;
    const body = parseBody(req.body);

    try {
        const inspection = await updateInspectionById(inspectionId, body);
        if (!inspection) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection not found'
        });

        generateResponse(inspection, 'Inspection updated successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.getAllInspections = async (req, res, next) => {
    const { search = "" } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const filters = [];

    if (req.query?.reportedBy) filters.push({ reportedBy: req.query.reportedBy });
    if (req.query?.vin) filters.push({ vin: req.query.vin });
    filters.push({ isDeleted: false });
    const query = filters.length > 0 ? { $and: filters } : {};

    const populate = [{
        path: 'reportedBy' ,'select': 'firstName lastName email image'
    }]

    try {
        const inspections = await getAllInspections({ query, page, limit, populate });
        generateResponse(inspections, 'Inspections fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.deleteInspectionById = async (req, res, next) => {
    const { inspectionId } = req.params;

    try {
        const inspection = await deleteInspectionById(inspectionId);
        if (!inspection) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Inspection not found'
        });

        generateResponse(inspection, 'Inspection deleted successfully', res);
    } catch (error) {
        next(error);
    }
}
