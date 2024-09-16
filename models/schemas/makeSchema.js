const { Schema, model } = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const makeSchema = new Schema({
    manufacturer: { type: String, required: true },
    // image: { type: String },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true, versionKey: false });

makeSchema.plugin(mongoosePaginate);
makeSchema.plugin(aggregatePaginate);

const MakeModel = model('Make', makeSchema);

module.exports = MakeModel;