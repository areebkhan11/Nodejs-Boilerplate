const { getServiceCategory, addServiceCategory, getServiceCategories, getAllServiceCategories } = require("../models/serviceCategoryModel");
const { addServiceCategoryOptions, getServiceCategoryOptions } = require("../models/serviceCategoryOptionsModel");
const { addServiceTypes, getAllServiceTypes } = require("../models/serviceTypeModel");
const { parseBody, generateResponse } = require("../utils");
const { STATUS_CODES } = require("../utils/constants");
const { addSingleServiceCategory } = require("../models/singleServiceCategoryModel")
// add service category
exports.addServiceCategory = async (req, res, next) => {
    const body = parseBody(req.body);

    try {
        // check if category already exists
        const categoryExist = await getServiceCategory({ type: body.type });
        if (categoryExist) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Service already exists'
        });

        const serviceCategory = await addServiceCategory(body);
        generateResponse(serviceCategory, 'Service category added successfully', res);
    } catch (error) {
        next(error);
    }
}

// fetch service categories
exports.fetchServiceCategories = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const filters = [];
    if (req.query?.serviceType) filters.push({ serviceType: req.query.serviceType });

    const query = filters.length > 0 ? { $and: filters } : { serviceType: { $eq: null } };

    try {
        const data = await getServiceCategories({ query, page, limit });
        if (data?.serviceCategories?.length === 0) {
            generateResponse(null, 'No items found', res);
            return;
        }

        generateResponse(data, 'Items fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

// fetch all service categories
exports.fetchAllServiceCategories = async (req, res, next) => {
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const filters = [];
    if (req.query?.serviceType) filters.push({ serviceType: req.query.serviceType });

    const query = filters.length > 0 ? { $and: filters } : {};
    const populate = [
        { path: 'serviceType' }
    ]
    try {
        const data = await getAllServiceCategories({ query, page, limit, populate });
        if (data?.serviceCategories?.length === 0) {
            generateResponse(null, 'No items found', res);
            return;
        }

        generateResponse(data, 'Items fetched successfully', res);
    } catch (error) {
        next(error);
    }
}


//add service types
exports.addTypes = async (req, res, next) => {
    const body = parseBody(req.body);
    try {
        if (!body.name) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Type Name Must be Added'
        });
        const types = await addServiceTypes(body);
        generateResponse(types, 'types added successfully', res);
    } catch (error) {
        next(error);
    }
}


exports.fetchServiceByType = async (req, res, next) => {
    try {
        const types = await getAllServiceTypes();
        generateResponse(types, 'Get types successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.addSingleService = async (req, res, next) => {
    const body = parseBody(req.body);
    try {
        if (!body.name) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Service Name Must be Added'
        });
        const types = await addSingleServiceCategory(body);
        generateResponse(types, 'service added successfully', res);
    } catch (error) {
        next(error);
    }
}

// create service category options
exports.addOptions = async (req, res, next) => {
    const body = parseBody(req.body);

    try {
        const options = await addServiceCategoryOptions(body);
        generateResponse(options, 'Options added successfully', res);
    } catch (error) {
        next(error);
    }
}

// get service category options
exports.fetchOptionsByCategory = async (req, res, next) => {
    const { categoryId } = req.params;

    try {
        const options = await getServiceCategoryOptions({ category: categoryId });
        if (options.length === 0) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Options not found'
        });

        generateResponse(options, 'Options fetched successfully', res);
    } catch (error) {
        next(error);
    }
}


// // add new service
// exports.addNewService = async (req, res, next) => {
//     const body = parseBody(req.body);
//     if (req?.files?.image?.length > 0) body.image = req.files?.image[0].path;

//     try {
//         const service = await addService(body);
//         generateResponse(service, 'Service added successfully', res);
//     } catch (error) {
//         next(error);
//     }
// }

// // get all services
// exports.fetchAllServices = async (req, res, next) => {
//     const page = req.query.page || 1;
//     const limit = req.query.limit || 10;
//     const query = {};

//     try {
//         const data = await getAllServices({ query, page, limit });
//         if (data?.services?.length === 0) {
//             generateResponse(null, 'No services found', res);
//             return;
//         }

//         generateResponse(data, 'Services fetched successfully', res);
//     } catch (error) {
//         next(error);
//     }
// }

// // update service
// exports.updateService = async (req, res, next) => {
//     const body = parseBody(req.body);
//     const { serviceId } = req.params;

//     if (req?.files?.image[0]?.length > 0) body.image = req.files?.image[0].path;

//     try {
//         const service = await updateServiceById(serviceId, body);
//         generateResponse(service, 'Service updated successfully', res);
//     } catch (error) {
//         next(error);
//     }
// }

// // delete service
// exports.deleteService = async (req, res, next) => {
//     const { serviceId } = req.params;

//     try {
//         const service = await deleteServiceById(serviceId);
//         if (!service) return next({
//             statusCode: STATUS_CODES.NOT_FOUND,
//             message: 'Service not found'
//         });

//         generateResponse(null, 'Service deleted successfully', res);
//     } catch (error) {
//         next(error);
//     }
// }