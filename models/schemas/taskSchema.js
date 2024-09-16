const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { STATUS } = require("../../utils/constants")

const taskSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    vin: { type: String, required: true },
    locationTo: { type: Schema.Types.ObjectId, ref: 'Location' },
    locationFrom: { type: Schema.Types.ObjectId, ref: 'Location' },
    status: { type: String, required: true, default: STATUS.PENDING },
    startTask: { type: Date, required: true },
    images: { type: [String], default: [] },
    details: { type: String, default: null },
    endTask: { type: Date, required: false },
    durationOfTask: { type: Number, required: false },
    isDeleted: { type: Boolean, required: false, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });

taskSchema.plugin(mongoosePaginate);
taskSchema.plugin(aggregatePaginate);

const TaskModel = model('Task', taskSchema);

module.exports = TaskModel;