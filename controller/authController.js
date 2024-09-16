const { generateResponse, parseBody, hashPassword, comparePassword } = require('../utils');
const {
    createUser,
    findUser,
    updateUser,
    generateToken,
} = require('../models/userModel');
const { loginUserValidation, } = require('../validation/authValidation');
const { STATUS_CODES, ROLES, PLATFORM } = require('../utils/constants');
const { hash } = require('bcrypt');
const { addShift, findShiftForUserAndDate, findUserShift } = require('../models/shiftModel');

exports.register = async (req, res, next) => {
    const body = parseBody(req.body);
    const { role } = req.user
    let valid = true;

    switch (role) {
        case ROLES.ADMIN:
            console.log('adminValidation');
            break;

        case ROLES.MANAGER:
            console.log('managerValidation');
            valid = [ROLES.EMPLOYEE, ROLES.TEAM_LEAD].includes(body.role);
            break;

        case ROLES.TEAM_LEAD:
            console.log('teamLeadValidation');
            valid = [ROLES.EMPLOYEE].includes(body.role);
            break;

        default: return next({
            statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
            message: 'Invalid role'
        });
    }

    if (!valid) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: `role ${body.role} not allowed`
    });

    const query = { $or: [{ email: body.email }, { phone: body.phone }] };

    try {
        // check if user already exists
        const userExists = await findUser(query);

        // validate existing fields
        if (userExists) {
            let existingKey;
            if (userExists.email === body.email) {
                existingKey = 'email';
                // } else if (userExists.vin === body.vin) {
                //     existingKey = 'vin';
            } else if (userExists.phone === body.phone) {
                existingKey = 'phone';
            }

            if (existingKey) return next({
                statusCode: STATUS_CODES.CONFLICT,
                message: `${existingKey} already exists!`
            });
        }
        //max 3 admin is allowed to register
        if (role === req.body.role) {

            const adminCount = await findUser({ role: ROLES.ADMIN, isActive: true }).countDocuments();
            if (adminCount >= 3) {
                return next({
                    statusCode: STATUS_CODES.CONFLICT,
                    message: 'Maximum 3 admin are allowed to register'
                });
            }
        }

        // hash password
        const hashedPassword = await hashPassword(body.password);
        body.password = hashedPassword;

        // create user in db
        const user = await createUser(body);
        generateResponse(user, 'Register successful', res);
    } catch (error) {
        next(error);
    }
}


// login user
exports.login = async (req, res, next) => {
    const body = parseBody(req.body);

    // Joi validation
    const { error } = loginUserValidation.validate(body);
    if (error) return next({
        statusCode: STATUS_CODES.UNPROCESSABLE_ENTITY,
        message: error.details[0].message
    });

    const deviceToken = body?.deviceToken || null;
    const platform = body?.platform

    try {
        let user = await findUser({ email: body?.email }).select('+password');
        var shift
        if (user.isActive === false) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'User is not active'
        })

        if (!platform) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Platform must be entered'
        });

        if (!user) return next({
            statusCode: STATUS_CODES.BAD_REQUEST,
            message: 'Invalid email or password'
        });

        const isMatch = await comparePassword(body.password, user.password);
        if (!isMatch) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Invalid email or password'
        });

        if (platform === PLATFORM.BROWSER && user.role === ROLES.EMPLOYEE) {
            return next({
                statusCode: STATUS_CODES.FORBIDDEN,
                message: 'Access denied. you are not allowed to login.'
            });
        }

        // Check if the user is logging in from a mobile device
        if (platform === PLATFORM.MOBILE && user.role !== ROLES.EMPLOYEE && user.role !== ROLES.TEAM_LEAD) {
            return next({
                statusCode: STATUS_CODES.FORBIDDEN,
                message: 'Access denied. Only mobile logins are allowed for team leads and employees.'
            });
        }

        const accessToken = generateToken(user);
        req.session.accessToken = accessToken;

        // Update user with deviceToken if provided
        if (deviceToken) user = await updateUser({ _id: user._id }, { $set: { deviceToken } });

        // Get the current date
        const currentDateCheck = new Date();

        // Set the time to the beginning of the day (midnight)
        currentDateCheck.setHours(0, 0, 0, 0);
        // Check if a shift entry already exists for today
        const existingShift = await findShiftForUserAndDate(user._id, currentDateCheck);
        // If no shift entry exists for today, add a new one
        if (!existingShift && user.role !== ROLES.ADMIN && user.role !== ROLES.MANAGER) {
            const currentDate = new Date();
            shift = await addShift({ user: user._id, reportingTime: { start: currentDate } });
        } else {
            shift = await findUserShift(user._id);
        }

        generateResponse({ user, accessToken, shift }, 'Login successful', res);
    } catch (error) {
        next(error);
    }

};

// check if admin@gmail.com & role admin exists, then return true, otherwise create admin
(async function checkAdmin() {
    try {
        const admin = await findUser({ email: 'miguel.henao@mdmtogo.com', role: ROLES.ADMIN, firstName: 'Miguel' });
        if (!admin) {
            // hash password
            const hashedPassword = await hash(process.env.ADMIN_PASSWORD, 10);

            // create user in db
            await createUser({ email: 'miguel.henao@mdmtogo.com', password: hashedPassword, role: ROLES.ADMIN, phone: '+1234567890', firstName: 'Miguel', parentId: null, positionName: 'Super Admin' });
            console.log('admin created >>>>>>>> ');
        } else {
            console.log('admin already exists >>>>>>>> ');
        }
    } catch (error) {
        console.log('error in checkAdmin', error);
    }
})();