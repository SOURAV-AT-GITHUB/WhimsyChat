const mongoose = require("mongoose")
const contactSchema = new mongoose.Schema({
    username:{type:String,required:true},
    contacts:[
        {
            user:{type:mongoose.Schema.Types.ObjectId,ref:"user",required:true},
            lastInteraction:{type:String,required:true},
        }
    ]
})
const ContactsModel = mongoose.model("contact",contactSchema)

module.exports = ContactsModel