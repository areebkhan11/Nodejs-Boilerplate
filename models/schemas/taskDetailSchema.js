const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");


const taskDetailSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    taskInitiate: { type: Number, default: 0 },
    taskComplete: { type: Number, default: 0 },

}, { timestamps: true, versionKey: false });

taskDetailSchema.plugin(mongoosePaginate);
taskDetailSchema.plugin(aggregatePaginate);

const TaskDetailModel = model('TaskDetail', taskDetailSchema);

module.exports = TaskDetailModel;