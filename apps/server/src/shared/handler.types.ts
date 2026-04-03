import type { Server, Socket } from "socket.io";

export type HandlerContext = {
  io: Server;
  socket: Socket;
};
