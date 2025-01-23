const ContactsModel = require("../models/contacts.model")

module.exports = async function getContacts (username){
  const response = await ContactsModel.findOne({username}).populate({
        path:'contacts.user',
        select:'username first_name last_name email findByEmail image'
    })

    if(!response) return []
    const contacts = response.contacts.map(contact=>({
        userId:contact.user._id,
        username:contact.user.username,
        first_name:contact.user.first_name,
        last_name:contact.user.last_name,
        email:contact.user.findByEmaail ? contact.user.email : null,
        image:contact.user.image,
        lastInteraction:contact.lastInteraction
    })).sort((a,b)=>new Date(b.lastInteraction) - new Date(a.lastInteraction))

    return contacts
}