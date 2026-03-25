import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3001";

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL);
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
