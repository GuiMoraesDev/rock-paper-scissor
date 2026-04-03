import type { Server, Socket } from "socket.io";
import { registerConnectionHandlers } from "./modules/connection/connection.handlers.js";
import { registerGameplayHandlers } from "./modules/gameplay/gameplay.handlers.js";
import { registerLobbyHandlers } from "./modules/lobby/lobby.handlers.js";
import { registerRematchHandlers } from "./modules/rematch/rematch.handlers.js";

export function registerSocketHandlers(io: Server, socket: Socket) {
  console.log("Client connected:", socket.id);

  const ctx = { io, socket };
  registerLobbyHandlers(ctx);
  registerGameplayHandlers(ctx);
  registerRematchHandlers(ctx);
  registerConnectionHandlers(ctx);
}
