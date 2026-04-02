import { SocketEvents } from "@rps/shared";
import type { Server, Socket } from "socket.io";
import {
  generateAIMove,
  generateGameId,
  resolveRound,
  sanitizeGame,
  sanitizeGameFull,
} from "./game-logic.js";
import {
  deleteGame,
  deleteSocketMeta,
  getGame,
  getSocketMeta,
  hasGame,
  setGame,
  setSocketMeta,
} from "./game-store.js";
import type { Game, RoundResult } from "./types.js";

export function registerSocketHandlers(io: Server, socket: Socket) {
  console.log("Client connected:", socket.id);

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

  socket.on(
    SocketEvents.CREATE_AI_GAME,
    ({ playerName, rounds, difficulty }) => {
      try {
        const gameId = generateGameId();
        const game: Game = {
          id: gameId,
          rounds,
          currentRound: 1,
          players: [
            {
              id: socket.id,
              name: playerName,
              ready: true,
              move: null,
              score: 0,
            },
            {
              id: "ai-bot",
              name: `AI (${difficulty})`,
              ready: true,
              move: null,
              score: 0,
            },
          ],
          roundResults: [],
          status: "playing",
          aiDifficulty: difficulty,
        };
        setGame(gameId, game);
        socket.join(gameId);
        setSocketMeta(socket.id, { gameId, playerIndex: 0 });
        socket.emit(SocketEvents.GAME_CREATED, {
          gameId,
          game: sanitizeGame(game),
        });
        console.log(
          `AI game ${gameId} created by ${playerName} (${difficulty})`,
        );
      } catch (error) {
        console.error("Error creating AI game:", error);
        socket.emit(SocketEvents.ERROR_MSG, {
          message: "Failed to create AI game.",
        });
      }
    },
  );

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

  socket.on(SocketEvents.PLAYER_READY, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game) return;

      game.players[meta.playerIndex].ready = true;

      const allReady =
        game.players.length === 2 && game.players.every((p) => p.ready);

      if (allReady) {
        game.status = "playing";
        game.currentRound = 1;
        game.players.forEach((p) => {
          p.move = null;
        });
      }

      io.to(meta.gameId).emit(SocketEvents.GAME_UPDATED, {
        game: sanitizeGame(game),
      });
    } catch (error) {
      console.error("Error on player-ready:", error);
      socket.emit(SocketEvents.ERROR_MSG, { message: "Something went wrong." });
    }
  });

  socket.on(SocketEvents.MAKE_MOVE, ({ move }) => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game || game.status !== "playing") return;

      game.players[meta.playerIndex].move = move;

      if (game.aiDifficulty && meta.playerIndex === 0) {
        game.players[1].move = generateAIMove(game.aiDifficulty, move);
      }

      io.to(meta.gameId).emit(SocketEvents.GAME_UPDATED, {
        game: sanitizeGame(game),
      });

      if (game.players[0].move && game.players[1].move) {
        const result = resolveRound(game.players[0].move, game.players[1].move);

        const roundResult: RoundResult = {
          round: game.currentRound,
          moves: [game.players[0].move, game.players[1].move],
          winner: result,
        };

        if (result === "player1") game.players[0].score++;
        if (result === "player2") game.players[1].score++;

        game.roundResults.push(roundResult);
        game.status = "round-result";

        io.to(meta.gameId).emit(SocketEvents.ROUND_RESULT, {
          game: sanitizeGameFull(game),
          roundResult,
        });

        if (game.currentRound >= game.rounds) {
          game.status = "finished";

          const p1Score = game.players[0].score;
          const p2Score = game.players[1].score;
          game.winner =
            p1Score > p2Score
              ? "player1"
              : p2Score > p1Score
                ? "player2"
                : "draw";

          io.to(meta.gameId).emit(SocketEvents.GAME_FINISHED, {
            game: sanitizeGameFull(game),
          });
        }
      }
    } catch (error) {
      console.error("Error on make-move:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to process move.",
      });
    }
  });

  socket.on(SocketEvents.NEXT_ROUND, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game || game.status !== "round-result") return;

      game.currentRound++;
      game.status = "playing";
      game.players.forEach((p) => {
        p.move = null;
      });

      io.to(meta.gameId).emit(SocketEvents.GAME_UPDATED, {
        game: sanitizeGame(game),
      });
    } catch (error) {
      console.error("Error on next-round:", error);
      socket.emit(SocketEvents.ERROR_MSG, {
        message: "Failed to start next round.",
      });
    }
  });

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

  socket.on(SocketEvents.REQUEST_REMATCH, () => {
    try {
      const meta = getSocketMeta(socket.id);
      if (!meta) return;
      const game = getGame(meta.gameId);
      if (!game || game.status !== "finished") return;

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

      const newGameId = generateGameId();
      const newGame: Game = {
        id: newGameId,
        rounds: oldGame.rounds,
        currentRound: 0,
        players: oldGame.players.map((p) => ({
          id: p.id,
          name: p.name,
          ready: false,
          move: null,
          score: 0,
        })),
        roundResults: [],
        status: "waiting",
      };

      setGame(newGameId, newGame);

      for (const player of oldGame.players) {
        const playerSocket = io.sockets.sockets.get(player.id);
        if (playerSocket) {
          playerSocket.leave(meta.gameId);
          playerSocket.join(newGameId);
          const pIdx = newGame.players.findIndex((p) => p.id === player.id);
          setSocketMeta(player.id, { gameId: newGameId, playerIndex: pIdx });
        }
      }

      deleteGame(meta.gameId);

      io.to(newGameId).emit(SocketEvents.REMATCH_GAME_CREATED, {
        gameId: newGameId,
        game: sanitizeGame(newGame),
      });
      console.log(`Rematch game ${newGameId} created from ${meta.gameId}`);
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
