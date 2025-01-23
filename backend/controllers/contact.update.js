const ContactsModel = require("../models/contacts.model");

module.exports = async function updateContacts(
  userId,
  contactId,
  lastInteraction
) {
  await ContactsModel.updateOne(
    {
      user: userId,
    },
    {
      $set: {
        "contacts.$[elem].lastInteraction": lastInteraction,
      },
      $addToSet: {
        contacts: {
          user: contactId,
          lastInteraction,
        },
      },
    },
    {
      arrayFilters: [{ "elem.user": contactId }],
      upsert: true,
    }
  );
};
