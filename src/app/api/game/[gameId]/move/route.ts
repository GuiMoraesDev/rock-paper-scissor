import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../_lib/auth";
import {
  resolveRound,
  sanitizeGame,
  sanitizeGameFull,
} from "../../../_lib/game.logic";
import { getGame } from "../../../_lib/game.store";
import type { RoundResult } from "../../../_lib/game.types";
import { broadcastToGame } from "../../../_lib/sse-connections";

const VALID_MOVES = ["rock", "paper", "scissors"];

type RouteContext = { params: Promise<{ gameId: string }> };

export async function POST(request: Request, context: RouteContext) {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER", "GUEST"]);
  if (!auth.success) return auth.response;

  const { meta } = auth;

  try {
    const { move } = await request.json();

    if (!VALID_MOVES.includes(move)) {
      return NextResponse.json({ error: "Invalid move" }, { status: 400 });
    }

    const game = getGame(gameId);
    if (!game || game.status !== "playing") {
      return NextResponse.json(
        { error: "Game is not in playing state" },
        { status: 409 },
      );
    }

    game.players[meta.playerIndex].move = move;

    broadcastToGame(gameId, "game-updated", {
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

      broadcastToGame(gameId, "round-result", {
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

        broadcastToGame(gameId, "game-finished", {
          game: sanitizeGameFull(game),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error on make-move:", error);
    return NextResponse.json(
      { error: "Failed to process move" },
      { status: 500 },
    );
  }
}
