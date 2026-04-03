import { SocketEvents } from "@rps/shared";
import { generateGameId, sanitizeGame } from "../../shared/game.logic.js";
import {
  deleteGame,
  getGame,
  getSocketMeta,
  setGame,
  setSocketMeta,
} from "../../shared/game.store.js";
import type { HandlerContext } from "../../shared/handler.types.js";
import type { Game } from "../../shared/types.js";

function createRematchGame(
  { io }: Pick<HandlerContext, "io">,
  oldGame: Game,
  oldGameId: string,
) {
  const isAIGame = oldGame.aiDifficulty !== undefined;

  const newGameId = generateGameId();
  const newGame: Game = {
    id: newGameId,
    rounds: oldGame.rounds,
    currentRound: 0,
    players: oldGame.players.map((p) => ({
      id: p.id,
      name: p.name,
      ready: p.id === "ai-bot",
      move: null,
      score: 0,
    })),
    roundResults: [],
    status: "waiting",
    ...(isAIGame && {
      aiDifficulty: oldGame.aiDifficulty,
      aiMoveHistory: oldGame.aiMoveHistory ?? [],
    }),
  };

  setGame(newGameId, newGame);

  for (const player of oldGame.players) {
    if (player.id === "ai-bot") continue;
    const playerSocket = io.sockets.sockets.get(player.id);
    if (playerSocket) {
      playerSocket.leave(oldGameId);
      playerSocket.join(newGameId);
      const pIdx = newGame.players.findIndex((p) => p.id === player.id);
      setSocketMeta(player.id, { gameId: newGameId, playerIndex: pIdx });
    }
  }

  deleteGame(oldGameId);

  io.to(newGameId).emit(SocketEvents.REMATCH_GAME_CREATED, {
    gameId: newGameId,
    game: sanitizeGame(newGame),
  });
  console.log(`Rematch game ${newGameId} created from ${oldGameId}`);
}

export function registerRematchHandlers({ io, socket }: HandlerContext) {
  socket.on(SocketEvents.REQUEST_REMATCH, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game || game.status !== "finished") return;

      if (game.aiDifficulty !== undefined) {
        createRematchGame({ io }, game, meta.gameId);
        return;
      }

      game.rematchRequestedBy = meta.playerIndex;
      const playerName = game.players[meta.playerIndex]?.name || "Unknown";

      socket.to(meta.gameId).emit(SocketEvents.REMATCH_REQUESTED, {
        playerName,
      });
      console.log(`${playerName} requested rematch in game ${meta.gameId}`);
    } catch (error) {
      console.error("Error on request-rematch:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to request rematch.",
      });
    }
  });

  socket.on(SocketEvents.REMATCH_ACCEPTED, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const oldGame = getGame(meta.gameId);
      if (!oldGame || oldGame.rematchRequestedBy === undefined) return;

      createRematchGame({ io }, oldGame, meta.gameId);
    } catch (error) {
      console.error("Error on rematch-accepted:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to create rematch game.",
      });
    }
  });

  socket.on(SocketEvents.REMATCH_DENIED, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game || game.rematchRequestedBy === undefined) return;

      const requesterSocket = io.sockets.sockets.get(
        game.players[game.rematchRequestedBy]?.id,
      );
      if (requesterSocket) {
        requesterSocket.emit(SocketEvents.REMATCH_DENIED, {
          playerName: game.players[meta.playerIndex]?.name || "Opponent",
        });
      }

      game.rematchRequestedBy = undefined;
      console.log(`Rematch denied in game ${meta.gameId}`);
    } catch (error) {
      console.error("Error on rematch-denied:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to deny rematch.",
      });
    }
  });
}
