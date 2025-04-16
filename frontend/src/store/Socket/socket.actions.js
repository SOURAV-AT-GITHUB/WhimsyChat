import {
  SOCKET_CONNECTION_REQUEST,
  SOCKET_CONNECTION_SUCCESS,
  SOCKET_CONNECTION_ERROR,
  SOCKET_CONNECTION_DISCONNECTED,
  ADD_ONE_MESSAGE,
  UPDATE_ONE_MESSAGE,
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

export function setupSocketListeners(
  socket,
  dispatch,
  currentOpenConversation
) {
  if (!socket) return;
  socket.off("receiveMessage")
  socket.off("messageDeliveredAndSeen")
  socket.off("messageDelivered")
  socket.off("updateMessage")

  socket.on("receiveMessage", (message) => {
    message.status.isDelivered = new Date()
    if (currentOpenConversation && message.conversationId === currentOpenConversation._id) {
      message.status.isSeen = new Date()
      socket.emit("messageDeliveredAndSeen", message);
    }else{
      socket.emit("messageDelivered",message)
    }
    message.status.isError = null
    dispatch({ type: ADD_ONE_MESSAGE, payload: message });
  });
  socket.on("updateMessage", (message) => {
    dispatch({ type: UPDATE_ONE_MESSAGE, payload: message });
  });
}
