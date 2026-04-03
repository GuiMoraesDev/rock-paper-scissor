import { SocketEvents } from "@rps/shared";
import {
  resolveRound,
  sanitizeGame,
  sanitizeGameFull,
} from "../../shared/game.logic.js";
import { getGame, getSocketMeta } from "../../shared/game.store.js";
import type { HandlerContext } from "../../shared/handler.types.js";
import type { Game, RoundResult } from "../../shared/types.js";
import { generateAIMove } from "../ai/ai-strategy.js";

function getAIMoveHistory(game: Game): string[] {
  const currentGameMoves = game.roundResults.map((r) => r.moves[0]);
  const pastMoves = game.aiMoveHistory ?? [];

  if (game.aiDifficulty === "normal") {
    return currentGameMoves;
  }

  return [...pastMoves, ...currentGameMoves];
}

export function registerGameplayHandlers({ io, socket }: HandlerContext) {
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

        if (game.aiDifficulty) {
          const history = getAIMoveHistory(game);
          game.players[1].move = generateAIMove(
            game.aiDifficulty,
            history,
            game.roundResults,
          );
        }
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

      if (game.aiDifficulty) {
        const history = getAIMoveHistory(game);
        game.players[1].move = generateAIMove(
          game.aiDifficulty,
          history,
          game.roundResults,
        );
      }

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
}
