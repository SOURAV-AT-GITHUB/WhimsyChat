const MessageRouter = require("express").Router();
const mongoose = require("mongoose");
const verifyToken = require("../middlewares/verifyToken");
const ConversationModel = require("../models/conversation.model");
const MessageModel = require("../models/message.model");
const ContactsModel = require("../models/contacts.model");
const UserModel = require("../models/user.model");
MessageRouter.post("/", verifyToken, async (req, res) => {
  try {
    let { conversationId, value, type, receiver, status } = req.body || {};
    if (
      typeof value !== "string" ||
      typeof type !== "string" ||
      !(typeof status === "object" && status !== null && !Array.isArray(status))
    ) {
      return res.status(400).json({ message: "Invalid request body" });
    }
    if (!conversationId) {
      // For first message, (if it's a group the conversation id must be created on the time of group creation)
      if (typeof receiver !== "string")
        return res
          .status(400)
          .json({ message: "sender required for first message" });
      const session = await mongoose.startSession();
      try {
        const senderExist = await UserModel.findById(req.user.mongoId);
        const receiverExist = await UserModel.findById(receiver);
        if (!senderExist)
          return res.status(404).json({ message: "Sender not found" });
        if (!receiverExist)
          return res.status(404).json({ message: "Receiver not found" });
        session.startTransaction();
        const newConversation = new ConversationModel({
          participants: [req.user.mongoId, receiver],
        });
        await newConversation.save({ session });
        await ContactsModel.updateMany(
          { _id: { $in: [senderExist.contacts, receiverExist.contacts] } },
          { $push: { contacts: newConversation._id } }
        ).session(session);
        const newMessage = new MessageModel({
          ...req.body,
          conversationId: newConversation._id,
        });
        const filteredConversation = newConversation._doc;
        filteredConversation.participants = [
          {
            first_name: receiverExist.first_name,
            last_name: receiverExist.last_name,
            image: receiverExist.image,
            email: receiverExist.findByEmail ? receiverExist.email : null,
          },
        ];
        newMessage.status.isSent = Date();
        await newMessage.save({ session });
        await session.commitTransaction();
        res.json({
          message: `${receiverExist.first_name} ${receiverExist.last_name} added to your contacts.`,
          data: { newMessage, newConversation: filteredConversation },
        });

        return;
      } catch (error) {
        await session.abortTransaction();

        return res.status(500).json({ message: error.message });
      } finally {
        await session.endSession();
      }
    } else {
      //for already present conversation
      const session = await mongoose.startSession();
      try {
        const conversation = await ConversationModel.findById(conversationId);
        if (!conversation)
          return res.status(404).json({ message: "Conversation not  found" });
        session.startTransaction();
        const newMessage = new MessageModel({ ...req.body });
        if (!newMessage.status.isSent) newMessage.status.isSent = new Date();
        await newMessage.save({ session });
        conversation.updatedAt = Date();
        await conversation.save({ session });
        await session.commitTransaction();
        return res.status(201).json({ message: "success", data: newMessage });
      } catch (error) {
        await session.abortTransaction();
        return res.status(500).json({ message: error.message });
      } finally {
        session.endSession();
      }
    }
  } catch (error) {
    //main try-catch block
    return res.status(500).json({ message: error.message });
  }
});

MessageRouter.get("/:conversationId", verifyToken, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation)
      return res.status(400).json({ message: "Conversation not found" });
    const messages = await MessageModel.find({ conversationId }).sort({
      createdAt: 1,
    });
    return res.json({ message: "success", data: messages });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});
module.exports = MessageRouter;
