const MessageModel = require("../models/message.model")

module.exports = async function (username){
    if(!username) return null
    try {
        const response = await MessageModel.find({username})
        console.log(response)
    } catch (error) {
        throw new Error(error.message)
    }
}