import {
  SOCKET_CONNECTION_REQUEST,
  SOCKET_CONNECTION_SUCCESS,
  SOCKET_CONNECTION_ERROR,
  SOCKET_CONNECTION_DISCONNECTED,
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
    dispatch({ type: SOCKET_CONNECTION_SUCCESS });
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

export function setupSocketListeners(socket, dispatch) {
  if (!socket) return;
  socket.on("receiveMessage", (message) => {
    //continue from here
    console.log(message);
  });
  socket.on("updateMessage", (message) => {
    //continue from here
    console.log(message);
  });
}
