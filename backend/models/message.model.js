const mongoose = require("mongoose")
const messageSchema = new mongoose.Schema({
    value:{type:String,required:true},
    type:{type:String,required:true},
    sender:{type:String,required:true},
    receiver:{type:String,required:true},
    date_time:{type:Number,required:true},
    status:{type:Object,required:true}
})
const MessageModel = mongoose.model("message",messageSchema)
module.exports = MessageModel