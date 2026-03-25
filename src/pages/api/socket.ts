import type { NextApiRequest, NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { registerSocketHandlers } from "@/lib/game-engine";

type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: HTTPServer & {
      io?: SocketIOServer;
    };
  };
};

export default function handler(
  _req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    console.log("Socket.IO already running");
    res.end();
    return;
  }

  console.log("Initializing Socket.IO...");

  const io = new SocketIOServer(res.socket.server, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  io.on("connection", (socket) => {
    registerSocketHandlers(io, socket);
  });

  res.socket.server.io = io;
  console.log("Socket.IO initialized");
  res.end();
}
