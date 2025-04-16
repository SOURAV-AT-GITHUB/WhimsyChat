require("dotenv").config();
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

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
    socket.on("messageRequest", (message) => {
        message._id = Date.now()
      message.status.isSent = new Date();
      const receiverOnline = connectedUsers.get(message.receiver);
      if (receiverOnline) {
        socket.to(receiverOnline).emit("receiveMessage", message);
      }
      socket.emit("updateMessage",message);
    });
    socket.on("messageDeliveredAndSeen", (message) => {
      if (message.tempId) delete message.tempId;
      const senderOnline = connectedUsers.get(message.sender);
      if (senderOnline) socket.to(senderOnline).emit("updateMessage", message);
      //update the message on database
    });
    socket.on("messageDelivered", (message) => {
      if (message.tempId) delete message.tempId;
      const senderOnline = connectedUsers.get(message.sender);
      if (senderOnline) socket.to(senderOnline).emit("updateMessage", message);
      //update the message on database
    });
    socket.on("messageSeen", (message) => {
      if (message.tempId) delete message.tempId;
      const senderOnline = connectedUsers.get(message.sender);
      if (senderOnline) socket.to(senderOnline).emit("updateMessage", message);
      //update the message on database
    });
  });

  return io;
};
