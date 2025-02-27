const mongoose = require("mongoose");
const messageSchema = new mongoose.Schema({
  conversationId:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"conversation"},
  value: { type: String, required: true },
  type: { type: String, required: true },
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  status: {
    isSent: { type: String, default: Date.now },
    isDelivered: { type: String, default: null },
    isSeen: { type: String, default: null },
    isError: { type: String, default: null },
  },
},{timestamps:true,versionKey:false});
const MessageModel = mongoose.model("message", messageSchema);
module.exports = MessageModel;
