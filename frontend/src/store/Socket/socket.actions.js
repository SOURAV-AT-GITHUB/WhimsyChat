import {
  SOCKET_CONNECTION_REQUEST,
  SOCKET_CONNECTION_SUCCESS,
  SOCKET_CONNECTION_ERROR,
  SOCKET_CONNECTION_DISCONNECTED,
  ADD_ONE_MESSAGE,
  UPDATE_ONE_MESSAGE,
  OPEN_SNACKBAR,
} from "../actionTypes";
import { io } from "socket.io-client";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export function connectSocket(token, dispatch) {
  if (!token) return;
  dispatch({ type: SOCKET_CONNECTION_REQUEST });
  const socketInstance = io(BACKEND_URL, {
    auth: {
      token,
    },
    reconnect: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 10000,
  });
  socketInstance.on("connect", () => {
    console.log("Websocket connection stablished");
    dispatch({ type: SOCKET_CONNECTION_SUCCESS, payload: socketInstance });
  });
  socketInstance.on("disconnect", () => {
    dispatch({ type: SOCKET_CONNECTION_DISCONNECTED });
    console.log("Websocket disconnected");
  });
  socketInstance.on("connect_error", (err) => {
    console.log("Socket connection error", err);
    if (err.message === "Token Error") {
      localStorage.removeItem("auth");
      window.location.href = "/signin";
    }
    dispatch({ type: SOCKET_CONNECTION_ERROR, payload: err.message });
  });
}
let currentNotification = null;
const sendNotification = (
  sender,
  body,
  icon,
  conversation,
  setCurrentOpenConversation
) => {
  if (Notification.permission === "granted") {
    if (currentNotification) {
      currentNotification.close();
    }
    currentNotification = new Notification(sender, {
      icon, // small icon next to title
      body,
      badge: "/favicon.jpg", // optional small badge (Android)
      vibrate: [200, 100, 200], // optional vibration pattern
    });
    currentNotification.onclick = () => {
      setCurrentOpenConversation(conversation);
      currentNotification.close()
    };
    currentNotification.onclose = () => {
      currentNotification = null;
    }
  }
};
export function setupSocketListeners(
  socket,
  dispatch,
  currentOpenConversation,
  contacts,
  setCurrentOpenConversation
) {
  if (!socket) return;
  socket.off("receiveMessage");
  socket.off("messageDeliveredAndSeen");
  socket.off("messageDelivered");
  socket.off("updateMessage");
  socket.off("messageError");

  socket.on("receiveMessage", (newMessage) => {
    newMessage.status.isDelivered = new Date();
    if (
      currentOpenConversation &&
      newMessage.conversationId === currentOpenConversation._id
    ) {
      newMessage.status.isSeen = new Date();
      socket.emit("messageDeliveredAndSeen", newMessage);
    } else {
      // console.log(newMessage.conversationId)
      const conversation = contacts.filter(
        (contact) => contact._id === newMessage.conversationId
      )[0];
      const sender = conversation.participants[0];
      socket.emit("messageDelivered", newMessage);
      sendNotification(
        `${sender.first_name} ${sender.last_name}`,
        newMessage.value,
        sender.image,
        conversation,
        setCurrentOpenConversation
      );
    }
    newMessage.status.isError = null;
    dispatch({ type: ADD_ONE_MESSAGE, payload: newMessage });
  });
  socket.on("updateMessage", (message) => {
    dispatch({ type: UPDATE_ONE_MESSAGE, payload: message });
  });
  socket.on("messageError", (message) => {
    dispatch({ type: OPEN_SNACKBAR, payload: { message, severity: "error" } });
  });
}
