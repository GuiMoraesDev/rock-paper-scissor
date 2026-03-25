const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory game storage
const games = new Map();

function generateGameId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

function resolveRound(move1, move2) {
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

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("create-game", ({ playerName, rounds }) => {
      const gameId = generateGameId();
      const game = {
        id: gameId,
        rounds: rounds,
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
        status: "waiting", // waiting, ready, playing, round-result, finished
      };
      games.set(gameId, game);
      socket.join(gameId);
      socket.gameId = gameId;
      socket.playerIndex = 0;
      socket.emit("game-created", { gameId, game: sanitizeGame(game) });
      console.log(`Game ${gameId} created by ${playerName}`);
    });

    socket.on("join-game", ({ gameId, playerName }) => {
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
      socket.gameId = gameId;
      socket.playerIndex = 1;

      io.to(gameId).emit("game-updated", { game: sanitizeGame(game) });
      socket.emit("joined-game", { gameId, game: sanitizeGame(game) });
      console.log(`${playerName} joined game ${gameId}`);
    });

    socket.on("player-ready", () => {
      const game = games.get(socket.gameId);
      if (!game) return;

      game.players[socket.playerIndex].ready = true;

      const allReady =
        game.players.length === 2 && game.players.every((p) => p.ready);

      if (allReady) {
        game.status = "playing";
        game.currentRound = 1;
        game.players.forEach((p) => (p.move = null));
      }

      io.to(socket.gameId).emit("game-updated", {
        game: sanitizeGame(game),
      });
    });

    socket.on("make-move", ({ move }) => {
      const game = games.get(socket.gameId);
      if (!game || game.status !== "playing") return;

      game.players[socket.playerIndex].move = move;

      // Notify that this player has chosen (without revealing the move)
      io.to(socket.gameId).emit("game-updated", {
        game: sanitizeGame(game),
      });

      // Check if both players have moved
      if (game.players[0].move && game.players[1].move) {
        const result = resolveRound(
          game.players[0].move,
          game.players[1].move
        );

        const roundResult = {
          round: game.currentRound,
          moves: [game.players[0].move, game.players[1].move],
          winner: result,
        };

        if (result === "player1") game.players[0].score++;
        if (result === "player2") game.players[1].score++;

        game.roundResults.push(roundResult);
        game.status = "round-result";

        io.to(socket.gameId).emit("round-result", {
          game: sanitizeGameFull(game),
          roundResult,
        });

        // Check if game is over
        if (game.currentRound >= game.rounds) {
          game.status = "finished";
          io.to(socket.gameId).emit("game-finished", {
            game: sanitizeGameFull(game),
          });
        }
      }
    });

    socket.on("next-round", () => {
      const game = games.get(socket.gameId);
      if (!game || game.status !== "round-result") return;

      game.currentRound++;
      game.status = "playing";
      game.players.forEach((p) => (p.move = null));

      io.to(socket.gameId).emit("game-updated", {
        game: sanitizeGame(game),
      });
    });

    socket.on("disconnect", () => {
      const game = games.get(socket.gameId);
      if (game) {
        io.to(socket.gameId).emit("player-disconnected", {
          playerName:
            game.players[socket.playerIndex]?.name || "Unknown player",
        });
        // Clean up game after a delay
        setTimeout(() => {
          if (games.has(socket.gameId)) {
            const g = games.get(socket.gameId);
            // Only delete if no players are connected
            const room = io.sockets.adapter.rooms.get(socket.gameId);
            if (!room || room.size === 0) {
              games.delete(socket.gameId);
              console.log(`Game ${socket.gameId} cleaned up`);
            }
          }
        }, 30000);
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  // Sanitize game state — hide opponent moves during play
  function sanitizeGame(game) {
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

  // Full game state — reveal moves (for round results)
  function sanitizeGameFull(game) {
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

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
