import { SocketEvents } from "@rps/shared";
import { generateGameId, sanitizeGame } from "../../shared/game.logic.js";
import {
  deleteGame,
  deleteSocketMeta,
  getGame,
  getSocketMeta,
  setGame,
  setSocketMeta,
} from "../../shared/game.store.js";
import type { HandlerContext } from "../../shared/handler.types.js";
import type { Game } from "../../shared/types.js";

export function registerLobbyHandlers({ io, socket }: HandlerContext) {
  socket.on(SocketEvents.CREATE_GAME, ({ playerName, rounds }) => {
    try {
      const gameId = generateGameId();
      const game: Game = {
        id: gameId,
        rounds,
        currentRound: 0,
        players: [
          {
            id: socket.id,
            name: playerName,
            ready: false,
            move: null,
            score: 0,
          },
        ],
        roundResults: [],
        status: "waiting",
      };
      setGame(gameId, game);
      socket.join(gameId);
      setSocketMeta(socket.id, { gameId, playerIndex: 0 });
      socket.emit(SocketEvents.GAME_CREATED, {
        gameId,
        game: sanitizeGame(game),
      });
      console.log(`Game ${gameId} created by ${playerName}`);
    } catch (error) {
      console.error("Error creating game:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to create game.",
      });
    }
  });

  socket.on(SocketEvents.ADD_AI_PLAYER, ({ difficulty, moveHistory }) => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      if (meta.playerIndex !== 0) return;

      const game = getGame(meta.gameId);
      if (!game) return;
      if (game.players.length >= 2) return;
      if (game.status !== "waiting") return;

      game.players.push({
        id: "ai-bot",
        name: `AI (${difficulty})`,
        ready: true,
        move: null,
        score: 0,
      });
      game.aiDifficulty = difficulty;
      game.aiMoveHistory = Array.isArray(moveHistory) ? moveHistory : [];

      io.to(meta.gameId).emit(SocketEvents.GAME_UPDATED, {
        game: sanitizeGame(game),
      });
      console.log(`AI (${difficulty}) added to game ${meta.gameId}`);
    } catch (error) {
      console.error("Error adding AI player:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to add AI player.",
      });
    }
  });

  socket.on(SocketEvents.JOIN_GAME, ({ gameId, playerName }) => {
    try {
      const game = getGame(gameId);
      if (!game) {
        socket.emit(SocketEvents.ERROR_MSG, { message: "Game not found!" });
        return;
      }
      if (game.players.length >= 2) {
        socket.emit(SocketEvents.ERROR_MSG, { message: "Game is full!" });
        return;
      }
      if (game.status !== "waiting") {
        socket.emit(SocketEvents.ERROR_MSG, {
          message: "Game already started!",
        });
        return;
      }

      game.players.push({
        id: socket.id,
        name: playerName,
        ready: false,
        move: null,
        score: 0,
      });

      socket.join(gameId);
      setSocketMeta(socket.id, { gameId, playerIndex: 1 });

      io.to(gameId).emit(SocketEvents.GAME_UPDATED, {
        game: sanitizeGame(game),
      });
      socket.emit(SocketEvents.JOINED_GAME, {
        gameId,
        game: sanitizeGame(game),
      });
      console.log(`${playerName} joined game ${gameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit(SocketEvents.ERROR_MSG, { message: "Failed to join game." });
    }
  });

  socket.on(SocketEvents.LEAVE_GAME, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game) return;

      const playerName =
        game.players[meta.playerIndex]?.name || "Unknown player";
      const isCreator = meta.playerIndex === 0;

      if (isCreator) {
        io.to(meta.gameId).emit(SocketEvents.PLAYER_DISCONNECTED, {
          playerName,
        });
        deleteGame(meta.gameId);
        console.log(`${playerName} destroyed game ${meta.gameId}`);
      } else {
        game.players.splice(meta.playerIndex, 1);
        game.status = "waiting";
        io.to(meta.gameId).emit(SocketEvents.GAME_UPDATED, {
          game: sanitizeGame(game),
        });
        console.log(`${playerName} left game ${meta.gameId}`);
      }

      socket.leave(meta.gameId);
      deleteSocketMeta(socket.id);
    } catch (error) {
      console.error("Error on leave-game:", error);
      socket.emit(SocketEvents.ERROR_MSG, { message: "Failed to leave game." });
    }
  });

  socket.on(SocketEvents.KICK_PLAYER, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      if (meta.playerIndex !== 0) return;

      const game = getGame(meta.gameId);
      if (!game || game.players.length < 2) return;
      if (game.status !== "waiting") return;

      const kicked = game.players[1];
      const kickedSocket = io.sockets.sockets.get(kicked.id);

      game.players.splice(1, 1);

      if (kickedSocket) {
        kickedSocket.emit(SocketEvents.PLAYER_KICKED, {
          message: "You have been kicked from the game.",
        });
        kickedSocket.leave(meta.gameId);
        deleteSocketMeta(kicked.id);
      }

      io.to(meta.gameId).emit(SocketEvents.GAME_UPDATED, {
        game: sanitizeGame(game),
      });
      console.log(`${kicked.name} was kicked from game ${meta.gameId}`);
    } catch (error) {
      console.error("Error on kick-player:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to kick player.",
      });
    }
  });
}
