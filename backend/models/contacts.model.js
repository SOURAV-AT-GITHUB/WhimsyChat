const mongoose = require("mongoose")
const contactSchema = new mongoose.Schema({
    contacts:[{type:mongoose.Schema.Types.ObjectId,ref:"conversation"},]
},{versionKey:false})
const ContactsModel = mongoose.model("contact",contactSchema)

module.exports = ContactsModel