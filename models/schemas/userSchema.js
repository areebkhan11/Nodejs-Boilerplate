const { Schema, model } = require("mongoose");
const { ROLES, ROLES_TYPE } = require('../../utils/constants');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const userSchema = new Schema({
    email: { type: String, lowercase: true, unique: true, required: true },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true },
    lastName: { type: String, default: null },
    badgeId: { type: String, default: null },
    parentId: { type: Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, required: true, unique: true },
    image: { type: String, default: null },
    role: { type: String, default: ROLES.USER, enum: Object.values(ROLES) },
    roleType: { type: String, enum: Object.values(ROLES_TYPE) },
    positionName: { type: String, default: null },
    fcmToken: { type: String, default: null, select: false },
    resetPasswordToken: { type: String, default: null, select: false },
    isActive: { type: Boolean, default: true },
    shifts: { type: [String], default: null },
    isDeleted: { type: Boolean, default: false },
    location: { type: [Number, Number], default: [0, 0] },
    online: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

userSchema.plugin(mongoosePaginate);
userSchema.plugin(aggregatePaginate);

const UserModel = model('User', userSchema);

module.exports = UserModel;