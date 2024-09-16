exports.getVehiclesQuery = (make, vin, model, category, filters) => {

    return {
        $and: [
            { isActive: true },
            // {
            //     $or: [
            //         { vin: { $regex: vin, $options: 'i' } },
            //         { model: { $regex: model, $options: 'i' } },
            //         { category: category },
            //         { make: make },
            //     ]
            // },
            ...filters
        ]
    }
};
