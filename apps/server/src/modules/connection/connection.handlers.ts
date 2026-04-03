import { SocketEvents } from "@rps/shared";
import { sanitizeGame, sanitizeGameFull } from "../../shared/game.logic.js";
import {
  deleteGame,
  deleteSocketMeta,
  getGame,
  getSocketMeta,
  hasGame,
} from "../../shared/game.store.js";
import type { HandlerContext } from "../../shared/handler.types.js";

export function registerConnectionHandlers({ io, socket }: HandlerContext) {
  socket.on(SocketEvents.REQUEST_GAME_STATE, ({ gameId }) => {
    try {
      const game = getGame(gameId);
      if (!game) {
        socket.emit(SocketEvents.GAME_STATE_RESPONSE, {
          game: null,
          playerIndex: -1,
        });
        return;
      }
      const pIdx = game.players.findIndex((p) => p.id === socket.id);
      if (pIdx === -1) {
        socket.emit(SocketEvents.GAME_STATE_RESPONSE, {
          game: null,
          playerIndex: -1,
        });
        return;
      }
      const sanitized =
        game.status === "round-result" || game.status === "finished"
          ? sanitizeGameFull(game)
          : sanitizeGame(game);
      socket.emit(SocketEvents.GAME_STATE_RESPONSE, {
        game: sanitized,
        playerIndex: pIdx,
      });
    } catch (error) {
      console.error("Error on request-game-state:", error);
      socket.emit(SocketEvents.GAME_STATE_RESPONSE, {
        game: null,
        playerIndex: -1,
      });
    }
  });

  socket.on("disconnect", () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (meta) {
        const game = getGame(meta.gameId);
        if (game) {
          io.to(meta.gameId).emit(SocketEvents.PLAYER_DISCONNECTED, {
            playerName:
              game.players[meta.playerIndex]?.name || "Unknown player",
          });
          setTimeout(() => {
            if (hasGame(meta.gameId)) {
              const room = io.sockets.adapter.rooms.get(meta.gameId);
              if (!room || room.size === 0) {
                deleteGame(meta.gameId);
                console.log(`Game ${meta.gameId} cleaned up`);
              }
            }
          }, 30000);
        }
        deleteSocketMeta(socket.id);
      }
      console.log("Client disconnected:", socket.id);
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
}
