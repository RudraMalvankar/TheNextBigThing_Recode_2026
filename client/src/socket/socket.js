import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:4001", {
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

export default socket;
