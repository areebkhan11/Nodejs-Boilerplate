const { Types } = require("mongoose");

// get all users (based on selected role)
exports.getUsersQuery = (user, filters) => {
    return {
        $and: [
            // { _id: { $ne: user } },
            // { isActive: true },
            { isDeleted: false },
            ...filters
        ]
    }
};


exports.getUsersQueryByRole = (user, firstName, selectedRole, filters) => {
    const roleFilter = getRoleFilter(selectedRole);

    const userFilters = [
        {
            $or: [
                { _id: user }, // Include the logged-in user
                { _id: { $ne: user } },
            ],
        },
        { isActive: true },
        { isDeleted: false },
        roleFilter,
        {
            $or: [
                { email: { $regex: firstName, $options: 'i' } },
                { firstName: { $regex: firstName, $options: 'i' } },
            ],
        },
    ];


    // Add individual filters to the $and array
    const finalFilters = userFilters.concat(filters);

    return { $and: finalFilters };
};

// Helper function to generate role-based filter
const getRoleFilter = (selectedRole) => {
    const roles = ['employee', 'team lead', 'manager', 'admin'];
    const selectedRoleIndex = roles.indexOf(selectedRole);

    if (selectedRoleIndex === -1) {
        // Invalid role or top-level role, return an empty filter
        return {};
    }

    // Include only users with the role immediately above the selected role
    const filteredRole = roles[selectedRoleIndex + 1];

    return { role: { $in: filteredRole } };
};

