const { Schema, model } = require('mongoose');
const { ROLES, ROLES_TYPE } = require('../../utils/constants');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");


const shiftSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    startShift: { type: Date, default: null },
    endShift: { type: Date, default: null },
    firstBreak: {
        start: { type: Date, default: null },
        end: { type: Date, default: null },
        total: { type: Number, default: 0 },
    },
    lunch: {
        start: { type: Date, default: null },
        end: { type: Date, default: null },
        total: { type: Number, default: 0 },
    },
    secondBreak: {
        start: { type: Date, default: null },
        end: { type: Date, default: null },
        total: { type: Number, default: 0 },
    },
    reportingTime: {
        start: { type: Date, default: null },
        end: { type: Date, default: null },
        total: { type: Number, default: null },
    },
    workHours: { type: Number, default: null },
    totalBreak: { type: Number, default: null },
    weekTotal: { type: Number, default: null },

}, { timestamps: true, versionKey: false });

shiftSchema.plugin(mongoosePaginate);
shiftSchema.plugin(aggregatePaginate);

const ShiftModel = model('Shift', shiftSchema);

module.exports = ShiftModel;