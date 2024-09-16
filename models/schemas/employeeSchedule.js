const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const employeeSchedule = new Schema({
    schedule: { type: Schema.Types.ObjectId, ref: 'Schedule' }
}, { timestamps: true, versionKey: false });


employeeSchedule.plugin(mongoosePaginate);
employeeSchedule.plugin(aggregatePaginate);

const employeeScheduleSchema = model('employeeSchedule', employeeSchedule);

module.exports = employeeScheduleSchema;