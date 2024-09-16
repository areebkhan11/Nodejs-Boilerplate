const { getAllUsers, findUser, getUser, removeUser, generateResetToken, updateUser, getAllUsersByRole } = require("../models/userModel");
const { deleteOTPs, addOTP, getOTP } = require("../models/otpModel");
const { generateResponse, generateRandomOTP, parseBody, generateRandomPassword, hashPassword, comparePassword } = require("../utils");
const { STATUS_CODES, EMAIL_TEMPLATES, ROLES } = require("../utils/constants");
const { generateOtpValidation, otpVerifyValidation, changePasswordValidation, resetPasswordValidation } = require("../validation/userValidation");
const { getUsersQuery, getUsersQueryByRole } = require("./queries/userQueries");
const mailer = require("../utils/mailer");
const { resetPasswordLinkValidation } = require("../validation/authValidation");
const { requestQueryValidation, updateUserValidation } = require("../validation/common");

// get all users (based on selected role) also included isFollowing or isFollower flag (User API)
exports.searchAllUsers = async (req, res, next) => {
    // Joi validation
    console.log(req.query, "<----req.query")
    const { error } = requestQueryValidation.validate(req.query);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    const user = req.user.id;
    const { firstName = "" } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    delete req.query.page;
    delete req.query.limit;

    const filters = [];

    // Iterate over req.query object
    for (const key in req.query) {
        const filter = {};
        filter[key] = req.query[key];
        //regex on firstName 
        if (key === "firstName") {
            filter[key] = { $regex: `.*${req.query[key]}.*`, $options: "i" };
        }
        filters.push(filter);
    }

    const query = getUsersQuery(user, filters);

    try {
        const users = await getAllUsers({ query, page, limit });
        if (users?.users.length === 0) {
            generateResponse(null, 'No users found', res);
            return;
        }

        generateResponse(users, 'Users found', res);
    } catch (error) {
        next(error);
    }
}

exports.searchAllUsersByRole = async (req, res, next) => {
    // Joi validation
    const { error } = requestQueryValidation.validate(req.query);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    const user = req.user.id;
    const { firstName = "", role } = req.query;
    const page = req.query.page || 1;
    const limit = req.query.limit || 100;
    delete req.query.page;
    delete req.query.limit;

    const filters = [];

    // Iterate over req.query object
    for (const key in req.query) {
        if (key !== 'role') {
            const filter = {};
            filter[key] = req.query[key];
            filters.push(filter);
        }
    }
    const query = getUsersQueryByRole(user, firstName, role, filters);

    try {
        const users = await getAllUsers({ query, page, limit });
        if (users?.users.length === 0) {
            generateResponse(null, 'No users found', res);
            return;
        }

        generateResponse(users, 'Users found', res);
    } catch (error) {
        next(error);
    }
}

// generate OTP
exports.generateOTP = async (req, res, next) => {
    const body = parseBody(req.body);
    const { phone } = body;

    // Joi validation
    const { error } = generateOtpValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const user = await findUser({ phone });
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });

        // delete all previous OTPs
        await deleteOTPs(phone);

        const otpObj = await addOTP({
            phone,
            otp: generateRandomOTP(),
        });

        // twilio service for sending OTP to phone number

        generateResponse({ otp: otpObj?.otp }, 'OTP sent successfully', res);
    } catch (error) {
        next(new Error(error.message));
    }
}

// verify OTP
exports.verifyOTP = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi validation
    const { error } = otpVerifyValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const otpObj = await getOTP({ otp: body.otp });
        if (!otpObj) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'OTP not found'
        });

        if (otpObj.isExpired()) return next({
            statusCode: STATUS_CODES.AUTHENTICATION_TIMEOUT,
            message: 'OTP expired'
        });

        let user = await findUser({ phone: otpObj.phone });
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });

        // generate random password
        const password = generateRandomPassword();

        // create hash of password
        const hash = await hashPassword(password);

        // update user with new password
        user.password = hash;
        await user.save();

        // twilio service for sending password to phone number

        generateResponse({ password }, 'Newly generated password sent to your phone number.', res);
    } catch (error) {
        next(error);
    }
}

exports.changePassword = async (req, res, next) => {
    const userId = req.user.id;
    const body = parseBody(req.body);

    // Joi validation
    const { error } = changePasswordValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        // get current login user
        let user = await findUser({ _id: userId }).select('+password');
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });

        // match old password with new password
        const isMatch = await comparePassword(body.oldPassword, user.password);
        if (!isMatch) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: "Old password is incorrect",
        });

        // check if new password is equal to old password
        if (body.oldPassword === body.newPassword) {
            return next({
                statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: "Please select another password, as the new password cannot be the same as the old password"
            });
        }

        // hash new password
        const hashedPassword = await hashPassword(body.newPassword);

        // update password
        user.password = hashedPassword;
        await user.save();

        // return response
        generateResponse(user, 'Password updated successfully', res);
    } catch (error) {
        next(error);
    }
}


exports.resetPassword = async (req, res, next) => {
    const { newPassword, resetPasswordToken } = parseBody(req.body);
    // Joi validation
    const { error } = resetPasswordValidation.validate({ newPassword, resetPasswordToken });
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        const user = await findUser({ resetPasswordToken }).select('+password +resetPasswordToken');
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });

        // check if new password is equal to old password
        const isSameAsOldPassword = await comparePassword(newPassword, user.password);
        if (isSameAsOldPassword) {
            return next({
                statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
                message: "Please select another password, as the new password cannot be the same as the old password"
            });
        }

        // hash new password
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        user.resetPasswordToken = null;

        await user.save();

        // return response
        generateResponse(user, 'Password reset successfully', res);
    } catch (error) {
        next(error);
    }
}


// forgot password and send reset password link to email
exports.sendResetPasswordLink = async (req, res, next) => {
    const { email } = parseBody(req.body);

    // Joi validation
    const { error } = resetPasswordLinkValidation.validate({ email });
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    try {
        // check if email exists
        const user = await findUser({ email });
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });
        // send reset password link to email
        const resetPasswordToken = generateResetToken(user);
        user.resetPasswordToken = resetPasswordToken;
        await user.save();

        // email service to send reset password link to email
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetPasswordToken}`;

        await mailer.mail(
            EMAIL_TEMPLATES.RESET_PASSWORD,
            resetUrl,
            email,
            email,
            user.firstName + " " + user.lastName,
            // process.env.EMAIL_USER // for testing
        );
        
        generateResponse({ resetUrl }, 'Reset password link is sent to your email', res);
    } catch (error) {
        next(error);
    }
}


exports.uploadImage = async (req, res, next) => {
    const { file } = req;
    if (!file) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: 'Image is required'
    });

    const { id } = req.user;

    // concatenate image url with users/ and file name
    const image = file.path;

    try {
        const user = await updateUser({ _id: id }, { image });
        if (!user) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'image not updated'
        });
        generateResponse(user, 'Profile image updated successfully', res);
    } catch (error) {
        next(error);
    }
}

exports.updateSingleUser = async (req, res, next) => {
    const body = parseBody(req.body);
    const { userId } = req.params;

    // Extract fields to update
    const { firstName, lastName, phone, role, badgeId, parentId, positionName, isActive, shifts, roleType } = body;
    console.log(userId, "<---userId")
    // Construct update object with only selected fields
    const updateFields = {};
    isActive ? updateFields.isActive = true : updateFields.isActive = false;
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (phone) updateFields.phone = phone;
    if (role) updateFields.role = role;
    if (badgeId) updateFields.badgeId = badgeId;
    if (parentId) updateFields.parentId = parentId;
    if (positionName) updateFields.positionName = positionName;
    if (shifts) updateFields.shifts = shifts;
    if (roleType) updateFields.roleType = roleType;

    try {

        // Check if user is admin or updating their own profile
        // if (req.user.role === ROLES.ADMIN || req.user.id === userId) {
        // const adminCount = await findUser({ role: ROLES.ADMIN }).countDocuments();
        // if (adminCount >= 3) {
        //     return next({
        //         statusCode: STATUS_CODES.CONFLICT,
        //         message: 'Maximum 3 admin are allowed'
        //     });
        // }
        const user = await updateUser({ _id: userId }, { $set: updateFields });
        if (!user) return next({
            statusCode: STATUS_CODES.NOT_FOUND,
            message: 'User not found'
        });

        generateResponse(user, 'User updated successfully', res);
        // } else {
        //     return next({
        //         statusCode: STATUS_CODES.UNAUTHORIZED,
        //         message: 'You are not authorized to Edit this user profile'
        //     });
        // }
    } catch (error) {
        next(error);
    }
}

exports.deleteUser = async (req, res, next) => {
    const { userId } = req.params;

    try {
        const user = await getUser({ _id: userId, isDeleted: false });
        if (!user) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'user not found'
        });

        await removeUser(userId);
        generateResponse(null, 'User deleted successfully', res);

    } catch (error) {
        next(error);
    }
}

exports.getAllUsersByRole = async (req, res, next) => {
    const { role } = req.params;
    try {
        const users = await getAllUsersByRole({ role });
        if (!users || users.users.length === 0) {
            return next({
                statusCode: STATUS_CODES.NOT_FOUND,
                message: 'Users not found'
            });
        }
        generateResponse(users, 'Users found', res);
    } catch (error) {
        next(error);
    }
}
