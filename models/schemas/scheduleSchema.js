const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { SCHEDULE_STATUS, SERVICE_DATA_STATUS } = require("../../utils/constants");


const serviceDataSchema = new Schema({
    serviceData: { type: Schema.Types.ObjectId, ref: 'SingleServiceCategory' },
    images: { type: [String], default: null },
    comment: { type: String, default: '' },
    status: { type: String, enum: Object.values(SERVICE_DATA_STATUS), default: SERVICE_DATA_STATUS.NO_STATUS },
});



const scheduleSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    employee: { type: Schema.Types.ObjectId, ref: 'User' },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    serviceType: { type: Schema.Types.ObjectId, ref: 'ServiceType' },
    vin: { type: String, default: '' },
    phases: [serviceDataSchema],
    location: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number, Number], default: [0, 0] },
        address: { type: String },
    },
    status: { type: String, enum: Object.values(SCHEDULE_STATUS), default: SCHEDULE_STATUS.NOT_STARTED },
    scheduleTime: { type: Date, default: null },
    isStarted: { type: Boolean, default: false },
    markedAsComplete: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

scheduleSchema.plugin(mongoosePaginate);
scheduleSchema.plugin(aggregatePaginate);

const ScheduleModel = model('Schedule', scheduleSchema);

module.exports = ScheduleModel;
