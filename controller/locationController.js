const { createLocation, getAllLocations, updateLocationById, deleteLocationById } = require("../models/locationModel");
const { generateResponse , parseBody } = require("../utils");
const { STATUS_CODES } = require("../utils/constants");
const {calculateDistance} = require("../utils");
const { locationValidation } = require("../validation/locationValidation");

exports.createLocation = async (req, res, next) => {
    const body = parseBody(req.body);
    let miles = 0; // Initialize miles outside the loop

    body.geofencing.forEach(geofence => {
        const { center } = geofence;
        const { lat: lat2, lng: lon2 } = center;
    
        // Hardcoded latitude and longitude for the first point (lat1, lon1)
        const lat1 = 43.65776253152304; // Ammrys Studios 
        const lon1 = -79.60348791534341; // 
    
        // Calculate the distance
        const distance = calculateDistance(lat1, lon1, lat2, lon2);
        console.log(distance, "sdsaddasasd");
    
        // Set the distance in the geofencing object
        geofence.distance = distance.toFixed(2);
        console.log(geofence, "obj");

        // Accumulate distance for each geofencing object
        miles += parseFloat(geofence.distance); // Parse to float for addition
    });

    body.distance = miles; // Assign total distance to body.distance

    // Validate and create location
    //joi validation
    const { error } = locationValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const location = await createLocation(body);
        generateResponse(location, 'Location created successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.getAllLocations = async (req, res, next) => {
    const { search = "" } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;

    const query = { name: { $regex: search, $options: 'i' }, isDeleted: false };


    try {
        const data = await getAllLocations({ query, page, limit });
        if (data?.locations?.length === 0) {
            generateResponse(null, 'No items found', res);
            return;
        }

        generateResponse(data, 'Items fetched successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.updateLocationById = async (req, res, next) => {
    const body = parseBody(req.body);
    const { error } = locationValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });
    const { locationId } = req.params;

    try {
        const location = await updateLocationById(locationId, body);
        if (!location) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Location not found'
        });

        generateResponse(location, 'Location updated successfully', res);
    }
    catch (error) {
        next(error);
    }
}

exports.deleteLocationById = async (req, res, next) => {
    const { locationId } = req.params;

    try {
        const location = await deleteLocationById(locationId);
        if (!location) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'Location not found'
        });

        generateResponse(null, 'Location deleted successfully', res);
        return;
    }
    catch (error) {
        next(error);
    }
}
