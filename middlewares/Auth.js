const { verify } = require('jsonwebtoken');
const { STATUS_CODES } = require('../utils/constants');

module.exports = (roles) => {
    return (req, res, next) => {
        const accessToken = req.header('accessToken') || req.session.accessToken;
        console.log(accessToken, "accessToken");
        if (!accessToken) return next({
            statusCode: STATUS_CODES.UNAUTHORIZED,
            message: 'Authorization failed!'
        });

        // decode token
        verify(accessToken, process.env.JWT_SECRET, function (err, decoded) {
            if (err) return next({
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: 'Invalid token!'
            });
            // set user
            req.user = { ...decoded };

            // check role  
            if (!roles.includes(req.user?.role)) return next({
                statusCode: STATUS_CODES.UNAUTHORIZED,
                message: 'Unauthorized access!'
            });

            next();
        });
    }
}