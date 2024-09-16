const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const processTime = new Schema({
    schedule: { type: Schema.Types.ObjectId, ref: 'Schedule' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date, default: Date.now },
    break: { type: Boolean, default: false },
    processTime: { type: Number, default: 0 },
    breakStartTime: { type: Date, default: Date.now },
    totalBreakTime: { type: Number, default: 0 },
});


processTime.plugin(mongoosePaginate);
processTime.plugin(aggregatePaginate);

const processTimeSchema = model('ProcessTime', processTime);

module.exports = processTimeSchema;