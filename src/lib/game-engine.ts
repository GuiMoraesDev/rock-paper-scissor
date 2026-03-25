import type { Server, Socket } from "socket.io";

const games = new Map<string, Game>();

interface Player {
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
  players: Player[];
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
  move2: string
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

  socket.on("create-game", ({ playerName, rounds }) => {
    try {
      const gameId = generateGameId();
      const game: Game = {
        id: gameId,
        rounds,
        currentRound: 0,
        players: [
          { id: socket.id, name: playerName, ready: false, move: null, score: 0 },
        ],
        roundResults: [],
        status: "waiting",
      };
      games.set(gameId, game);
      socket.join(gameId);
      (socket as any).gameId = gameId;
      (socket as any).playerIndex = 0;
      socket.emit("game-created", { gameId, game: sanitizeGame(game) });
      console.log(`Game ${gameId} created by ${playerName}`);
    } catch (error) {
      console.error("Error creating game:", error);
      socket.emit("error-msg", { message: "Failed to create game." });
    }
  });

  socket.on("join-game", ({ gameId, playerName }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit("error-msg", { message: "Game not found!" });
        return;
      }
      if (game.players.length >= 2) {
        socket.emit("error-msg", { message: "Game is full!" });
        return;
      }
      if (game.status !== "waiting") {
        socket.emit("error-msg", { message: "Game already started!" });
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
      (socket as any).gameId = gameId;
      (socket as any).playerIndex = 1;

      io.to(gameId).emit("game-updated", { game: sanitizeGame(game) });
      socket.emit("joined-game", { gameId, game: sanitizeGame(game) });
      console.log(`${playerName} joined game ${gameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
      socket.emit("error-msg", { message: "Failed to join game." });
    }
  });

  socket.on("player-ready", () => {
    try {
      const game = games.get((socket as any).gameId);
      if (!game) return;

      game.players[(socket as any).playerIndex].ready = true;

      const allReady =
        game.players.length === 2 && game.players.every((p) => p.ready);

      if (allReady) {
        game.status = "playing";
        game.currentRound = 1;
        game.players.forEach((p) => (p.move = null));
      }

      io.to((socket as any).gameId).emit("game-updated", {
        game: sanitizeGame(game),
      });
    } catch (error) {
      console.error("Error on player-ready:", error);
      socket.emit("error-msg", { message: "Something went wrong." });
    }
  });

  socket.on("make-move", ({ move }) => {
    try {
      const game = games.get((socket as any).gameId);
      if (!game || game.status !== "playing") return;

      game.players[(socket as any).playerIndex].move = move;

      io.to((socket as any).gameId).emit("game-updated", {
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

        io.to((socket as any).gameId).emit("round-result", {
          game: sanitizeGameFull(game),
          roundResult,
        });

        if (game.currentRound >= game.rounds) {
          game.status = "finished";
          io.to((socket as any).gameId).emit("game-finished", {
            game: sanitizeGameFull(game),
          });
        }
      }
    } catch (error) {
      console.error("Error on make-move:", error);
      socket.emit("error-msg", { message: "Failed to process move." });
    }
  });

  socket.on("next-round", () => {
    try {
      const game = games.get((socket as any).gameId);
      if (!game || game.status !== "round-result") return;

      game.currentRound++;
      game.status = "playing";
      game.players.forEach((p) => (p.move = null));

      io.to((socket as any).gameId).emit("game-updated", {
        game: sanitizeGame(game),
      });
    } catch (error) {
      console.error("Error on next-round:", error);
      socket.emit("error-msg", { message: "Failed to start next round." });
    }
  });

  socket.on("request-game-state", ({ gameId }) => {
    try {
      const game = games.get(gameId);
      if (!game) {
        socket.emit("game-state-response", { game: null, playerIndex: -1 });
        return;
      }
      const pIdx = game.players.findIndex((p) => p.id === socket.id);
      if (pIdx === -1) {
        socket.emit("game-state-response", { game: null, playerIndex: -1 });
        return;
      }
      const sanitized =
        game.status === "round-result" || game.status === "finished"
          ? sanitizeGameFull(game)
          : sanitizeGame(game);
      socket.emit("game-state-response", { game: sanitized, playerIndex: pIdx });
    } catch (error) {
      console.error("Error on request-game-state:", error);
      socket.emit("game-state-response", { game: null, playerIndex: -1 });
    }
  });

  socket.on("disconnect", () => {
    try {
      const gameId = (socket as any).gameId;
      const game = games.get(gameId);
      if (game) {
        io.to(gameId).emit("player-disconnected", {
          playerName:
            game.players[(socket as any).playerIndex]?.name || "Unknown player",
        });
        setTimeout(() => {
          if (games.has(gameId)) {
            const room = io.sockets.adapter.rooms.get(gameId);
            if (!room || room.size === 0) {
              games.delete(gameId);
              console.log(`Game ${gameId} cleaned up`);
            }
          }
        }, 30000);
      }
      console.log("Client disconnected:", socket.id);
    } catch (error) {
      console.error("Error on disconnect:", error);
    }
  });
}
