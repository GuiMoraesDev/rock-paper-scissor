import { NextResponse } from "next/server";
import { generateAIMove } from "../../../_lib/ai-strategy";
import { authenticatePlayer } from "../../../_lib/auth";
import { getAIMoveHistory, sanitizeGame } from "../../../_lib/game.logic";
import { getGame } from "../../../_lib/game.store";
import { broadcastToGame } from "../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER", "GUEST"]);
  if (!auth.success) return auth.response;

  try {
    const game = getGame(gameId);
    if (!game || game.status !== "round-result") {
      return NextResponse.json(
        { error: "Game is not in round-result state" },
        { status: 409 },
      );
    }

    game.currentRound++;
    game.status = "playing";
    game.players.forEach((p) => {
      p.move = null;
    });

    if (game.aiDifficulty) {
      const history = getAIMoveHistory({ game });
      game.players[1].move = generateAIMove({
        difficulty: game.aiDifficulty,
        moveHistory: history,
        roundResults: game.roundResults,
      });
    }

    broadcastToGame(gameId, "game-updated", {
      game: sanitizeGame({ game }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error on next-round:", error);
    return NextResponse.json(
      { error: "Failed to start next round" },
      { status: 500 },
    );
  }
};
