const multer = require('multer');
const fs = require('fs');
const FCM = require('fcm-node');
const { STATUS_CODES, ROLES } = require('./constants');
const moment = require('moment');
const generator = require('generate-password');
const bcrypt = require('bcrypt');

exports.generateResponse = (data, message, res, code = 200) => {
    return res.status(code).json({
        statusCode: code,
        message,
        data,
    });
}

exports.parseBody = (body) => {
    let obj;
    if (typeof body === "object") obj = body;
    else obj = JSON.parse(body);
    return obj;
}

exports.generateRandomOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

const generateFilename = (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '.' + file.originalname.split('.').pop());
};

const filterImage = (req, file, cb) => {
    // check mime type
    if (!file.mimetype.match(/image\/(jpg|JPG|webp|jpeg|JPEG|png|PNG|gif|GIF|jfif|JFIF)/)) {
        req.fileValidationError = 'Only image files are allowed!';
        return cb(null, false);
    }
    cb(null, true);
}

exports.upload = (folderName) => {
    return multer({
        storage: multer.diskStorage({
            destination: function (req, file, cb) {
                const path = `uploads/${folderName}/`;
                fs.mkdirSync(path, { recursive: true })
                cb(null, path);
            },

            // By default, multer removes file extensions so let's add them back
            filename: generateFilename
        }),
        limits: { fileSize: 10 * 1024 * 1024 },  // max 10MB //
        fileFilter: filterImage
    })
}

// exports.sendNotificationToAll = ({ body, fcmTokens }) => {
//     const serverKey = process.env.FIREBASE_SERVER_KEY;
//     const fcm = new FCM(serverKey);
//     const title = process.env.APP_NAME;

//     const message = {
//         // the registration tokens of the devices you want to send the message to
//         registration_ids: [...fcmTokens],
//         notification: { title, body },
//     };

//     fcm.send(message, function (err, response) {
//         if (err) {
//             console.log("FCM - Something has gone wrong!");
//         } else {
//             console.log("Successfully sent with response: ", response);
//         }
//     });
// }

// pagination with mongoose paginate library
exports.getMongoosePaginatedData = async ({
    model, page = 1, limit = 10, query = {}, populate = '', select = '-password', sort = { createdAt: -1 },
}) => {
    const options = {
        select,
        sort,
        populate,
        lean: true,
        page,
        limit,
        customLabels: {
            totalDocs: 'totalItems',
            docs: 'data',
            limit: 'perPage',
            page: 'currentPage',
            meta: 'pagination',
        },
    };

    const { data, pagination } = await model.paginate(query, options);
    delete pagination?.pagingCounter;

    return { data, pagination };
}

// aggregate pagination with mongoose paginate library
exports.getMongooseAggregatePaginatedData = async ({
    model, page = 1, limit = 10, query = [], populate = '', select = '-password', sort = { createdAt: -1 },
}) => {
    const options = {
        select,
        sort,
        populate,
        lean: true,
        page,
        limit,
        customLabels: {
            totalDocs: 'totalItems',
            docs: 'data',
            limit: 'perPage',
            page: 'currentPage',
            meta: 'pagination',
        },
    };

    const myAggregate = model.aggregate(query);
    const { data, pagination } = await model.aggregatePaginate(myAggregate, options);

    delete pagination?.pagingCounter;

    return { data, pagination };
}

exports.sendNotification = ({ title, body, fcmToken, data, priority = 'normal' }) => {
    const serverKey = process.env.FIREBASE_SERVER_KEY;
    const fcm = new FCM(serverKey);

    const message = {
        to: fcmToken,
        priority,
        notification: {
            title,
            body,
        },
        data
    };

    // Send the notification
    fcm.send(message, (error, response) => {
        if (error) {
            console.error('Error sending notification:', error);
        } else {
            console.log('Notification sent successfully:', response);
        }
    });
}

exports.formatDate = (date) => moment(date).format('DD-MM-YYYY');

exports.formatTime = (date) => moment(date).format('HH:mm:ss');

exports.formatDateTime = (date) => moment(date).format('DD-MM-YYYY HH:mm:ss');

exports.generateRandomPassword = () => generator.generate({
    length: 8,
    uppercase: true,
    lowercase: true,
    numbers: true
})

exports.hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
}

exports.comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

exports.calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

