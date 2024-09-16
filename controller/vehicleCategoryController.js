const { createCategory, updateCategory, getAllCategories, deleteCategory, getCategory } = require("../models/vehicleCategoryModel");
const { generateResponse, parseBody } = require("../utils");
const { STATUS_CODES } = require("../utils/constants");
const { vehicleCategoryValidation } = require("../validation/categoryValidation");
const { requestQueryValidation } = require("../validation/common");

// add vehicle category
exports.addVehicleCategory = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi validation
    const { error } = vehicleCategoryValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    // if (!req.files?.image || req?.files?.image.length === 0) return next({
    //     statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
    //     message: 'Image is required'
    // });

    // body.image = req.files?.image[0]?.path;

    try {
        // check if category already exists
        const categoryExist = await getCategory({ name: body.name, isDeleted: false });
        if (categoryExist) return next({
            statusCode: STATUS_CODES.CONFLICT,
            message: 'Category already exists'
        });

        const vehicleCategory = await createCategory(body);
        generateResponse(vehicleCategory, 'Vehicle category added successfully', res);
    } catch (error) {
        next(error);
    }
}

// update vehicle category
exports.updateVehicleCategory = async (req, res, next) => {
    const { categoryId } = req.params;
    const body = req.body;

    // Joi validation
    const { error } = vehicleCategoryValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    if (req.files?.image && req?.files?.image.length > 0) body.image = req.files?.image[0].path;

    try {
        const vehicleCategory = await updateCategory({ _id: categoryId }, body);
        generateResponse(vehicleCategory, 'Vehicle category updated successfully', res);
    } catch (error) {
        next(error);
    }

}

// get all vehicle categories
exports.getAllVehicleCategories = async (req, res, next) => {
    // Joi validation
    const { error } = requestQueryValidation.validate(req.query);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    const { search = "" } = req.query;
    const page = req.query?.page || 1;
    const limit = req.query?.limit || 10;

    const query = { name: { $regex: search, $options: "i", }, isDeleted: false };

    try {
        const categoriesData = await getAllCategories({ query, page, limit });
        if (categoriesData?.categories?.length === 0) {
            generateResponse(null, 'No vehicle categories found', res);
            return;
        }

        generateResponse(categoriesData, 'Vehicle categories retrieved successfully', res);
    } catch (error) {
        next(error);
    }
}

// get vehicle category
exports.getVehicleCategory = async (req, res, next) => {
    const { categoryId } = req.params;

    try {
        const category = await getCategory({ _id: categoryId });
        if (!category) {
            return next({
                statusCode: STATUS_CODES.NOT_FOUND,
                message: 'Vehicle category not found'
            });
        }

        generateResponse(category, 'Vehicle category retrieved successfully', res);
    } catch (error) {
        next(error);
    }
}

// delete vehicle category
exports.deleteVehicleCategory = async (req, res, next) => {
    const { categoryId } = req.params;

    if (!categoryId) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Please, provide categoryId properly.'
    });

    try {
        const category = await deleteCategory(categoryId);
        console.log('category', category);
        if (!category) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Vehicle category not found'
        });


        generateResponse(null, 'Vehicle category deleted successfully', res);
    } catch (error) {
        next(error);
    }
}