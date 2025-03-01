import { createContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
import {
  SOCKET_DISCONNECTED,
  SOCKET_CONNECTING,
  SOCKET_CONNECTED,
  SOCKET_ERROR,
} from "../constants/socketStatus";
const SocketContext = createContext();
//eslint-disable-next-line react/prop-types
function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [socketStatus, setSocketStatus] = useState(SOCKET_DISCONNECTED);
  const { token } = useSelector((store) => store.authorization);
  useEffect(() => {
    if (!token) return;
    const socketInstance = io(BACKEND_URL, {
      auth: {
        token,
      },
      reconnect: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 10000,
    });
    setSocketStatus(SOCKET_CONNECTING);
    socketInstance.on("connect", () => {
      console.log("Websocket connection stablished");
      setSocket(socketInstance);
      setSocketStatus(SOCKET_CONNECTED);
    });
    socketInstance.on("disconnect", () => {
      setSocketStatus(SOCKET_DISCONNECTED);
      setSocket(null);
      console.log("Websocket disconnected");
    });
    socketInstance.on("connect_error", (err) => {
      console.log("Socket connection error", err);
      if (err.message === "Token Error") {
        localStorage.removeItem("auth");
        window.location.href = "/signin";
      }
      setSocketStatus(SOCKET_ERROR);
    });
    return () => {
      setSocketStatus(SOCKET_DISCONNECTED);
      socketInstance?.disconnect();
    };
  }, [token]);
  return (
    <SocketContext.Provider value={{ socket, socketStatus }}>
      {children}
    </SocketContext.Provider>
  );
}
export { SocketContext, SocketProvider };
