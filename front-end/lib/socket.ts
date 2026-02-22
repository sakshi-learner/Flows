import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";

export function createSocket(): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket", "polling"],
    withCredentials: true, // ✅ Cookies automatically bhejega
    autoConnect: false,    // ✅ Manual control (login ke baad connect karenge)
  });
}