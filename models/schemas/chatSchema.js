const { Schema, model } = require("mongoose");

const chatSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    receiver: { type: Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    image: { type: String },
    isRead: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true, versionKey: false });



const ChatModel = model('Chat', chatSchema);

module.exports = ChatModel;