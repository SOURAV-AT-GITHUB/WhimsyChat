const mongoose = require("mongoose")

const conversationSchema = new mongoose.Schema({
    participants:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
    isGroup:{type:Boolean,default:false},
     groupName: {
        type: String,
        required: function() {
          return this.isGroup;
        }
    },
     groupImage: {
        type: String,
        required: function() {
          return this.isGroup;
        },
    },
},{ timestamps: true,versionKey:false})

const ConversationModel = mongoose.model("conversation",conversationSchema)

module.exports = ConversationModel