import { SocketEvents } from "@rps/shared";
import type { Server, Socket } from "socket.io";

type SocketMeta = {
  gameId: string;
  playerIndex: number;
};

const games = new Map<string, Game>();
const socketMeta = new Map<string, SocketMeta>();

interface ServerPlayer {
  id: string;
  name: string;
  ready: boolean;
  move: string | null;
  score: number;
}

interface Game {
  id: string;
  rounds: number;
  currentRound: number;
  players: ServerPlayer[];
  roundResults: RoundResult[];
  status: "waiting" | "ready" | "playing" | "round-result" | "finished";
}

interface RoundResult {
  round: number;
  moves: [string, string];
  winner: "player1" | "player2" | "draw";
}

function generateGameId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function resolveRound(
  move1: string,
  move2: string,
): "player1" | "player2" | "draw" {
  if (move1 === move2) return "draw";
  if (
    (move1 === "rock" && move2 === "scissors") ||
    (move1 === "scissors" && move2 === "paper") ||
    (move1 === "paper" && move2 === "rock")
  ) {
    return "player1";
  }
  return "player2";
}

function sanitizeGame(game: Game) {
  return {
    id: game.id,
    rounds: game.rounds,
    currentRound: game.currentRound,
    status: game.status,
    roundResults: game.roundResults,
    players: game.players.map((p) => ({
      name: p.name,
      ready: p.ready,
      score: p.score,
      hasChosen: !!p.move,
    })),
  };
}

function sanitizeGameFull(game: Game) {
  return {
    id: game.id,
    rounds: game.rounds,
    currentRound: game.currentRound,
    status: game.status,
    roundResults: game.roundResults,
    players: game.players.map((p) => ({
      name: p.name,
      ready: p.ready,
      score: p.score,
      move: p.move,
      hasChosen: !!p.move,
    })),
  };
}

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
      games.set(gameId, game);
      socket.join(gameId);
      socketMeta.set(socket.id, { gameId, playerIndex: 0 });
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

  socket.on(SocketEvents.JOIN_GAME, ({ gameId, playerName }) => {
    try {
      const game = games.get(gameId);
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
      socketMeta.set(socket.id, { gameId, playerIndex: 1 });

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

  socket.on(SocketEvents.PLAYER_READY, () => {
    try {
      const meta = socketMeta.get(socket.id);
      if (!meta) return;
      const game = games.get(meta.gameId);
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
      const meta = socketMeta.get(socket.id);
      if (!meta) return;
      const game = games.get(meta.gameId);
      if (!game || game.status !== "playing") return;

      game.players[meta.playerIndex].move = move;

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
      const meta = socketMeta.get(socket.id);
      if (!meta) return;
      const game = games.get(meta.gameId);
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
      const game = games.get(gameId);
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
      const meta = socketMeta.get(socket.id);
      if (meta) {
        const game = games.get(meta.gameId);
        if (game) {
          io.to(meta.gameId).emit(SocketEvents.PLAYER_DISCONNECTED, {
            playerName:
              game.players[meta.playerIndex]?.name || "Unknown player",
          });
          setTimeout(() => {
            if (games.has(meta.gameId)) {
              const room = io.sockets.adapter.rooms.get(meta.gameId);
              if (!room || room.size === 0) {
                games.delete(meta.gameId);
                console.log(`Game ${meta.gameId} cleaned up`);
              }
            }
          }, 30000);
        }
        socketMeta.delete(socket.id);
      }
      console.log("Client disconnected:", socket.id);
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
}
