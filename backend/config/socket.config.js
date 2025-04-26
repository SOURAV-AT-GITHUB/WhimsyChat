require("dotenv").config();
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const MessageModel = require("../models/message.model");
const connectedUsers = new Map();

module.exports = function setupSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
    },
  });
  //for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    jwt.verify(token, process.env.JWT_SECRET_SIGN_IN, (err, decoded) => {
      if (err) {
        return next(new Error("Token Error"));
      } else {
        socket.user = decoded;
        next();
      }
    });
  });
  //on connection
  io.on("connection", async (socket) => {
    const { username } = socket.user;
    const { mongoId } = socket.user;
    connectedUsers.set(mongoId, socket.id);
    console.log(`${username} connected with id ${socket.id}`);

    socket.on("disconnect", () => {
      connectedUsers.delete(mongoId);
      console.log(`${username} disconnected`);
    });
    socket.on("messageRequest", async (message) => {
      message.status.isSent = new Date();
      const tempId = message.tempId;
      try {
        const newMessage = await new MessageModel(message).save();
        const receiverOnline = connectedUsers.get(message.receiver);
        if (receiverOnline) {
          socket.to(receiverOnline).emit("receiveMessage", newMessage);
        }
        socket.emit("updateMessage", { ...newMessage._doc, tempId });
      } catch (error) {
        socket.emit("messageError", error.message);
      }
    });
    socket.on("messageDeliveredAndSeen", async (message) => {
      if (message?.tempId) delete message.tempId;
      //update the message on database
      try {
        await MessageModel.findByIdAndUpdate(message._id, message);
        const senderOnline = connectedUsers.get(message.sender);
        if (senderOnline)
          socket.to(senderOnline).emit("updateMessage", message);
      } catch (error) {
        socket.emit("messageError", error.message);
      }
    });
    socket.on("messageDelivered", async (message) => {
      if (message?.tempId) delete message.tempId;
      //update the message on database
      try {
        await MessageModel.findByIdAndUpdate(message._id, message);
        const senderOnline = connectedUsers.get(message.sender);
        if (senderOnline)
          socket.to(senderOnline).emit("updateMessage", message);
      } catch (error) {
        socket.emit("messageError", error.message);
      }
    });
    socket.on("messageSeen", async (message) => {
      if (message?.tempId) delete message.tempId;
      //update the message on database
      try {
        await MessageModel.findByIdAndUpdate(message._id, message);
        const senderOnline = connectedUsers.get(message.sender);
        if (senderOnline)
          socket.to(senderOnline).emit("updateMessage", message);
      } catch (error) {
        socket.emit("messageError", error.message);
      }
    });
  });

  return io;
};
