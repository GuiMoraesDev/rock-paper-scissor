import { NextResponse } from "next/server";
import { generateAIMove } from "../../../_lib/ai-strategy";
import { authenticatePlayer } from "../../../_lib/auth";
import { captureApiError } from "../../../_lib/capture-error";
import { getAIMoveHistory, sanitizeGame } from "../../../_lib/game.logic";
import { findGame } from "../../../_lib/game.repository";
import { broadcastToGame } from "../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER", "GUEST"]);
  if (!auth.success) return auth.response;

  const { meta } = auth;

  try {
    const game = findGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

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
        const history = getAIMoveHistory({ game });
        game.players[1].move = generateAIMove({
          difficulty: game.aiDifficulty,
          moveHistory: history,
          roundResults: game.roundResults,
        });
      }
    }

    broadcastToGame(gameId, "game-updated", {
      game: sanitizeGame({ game }),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError({ error, context: { gameId } });
    console.error("Error on player-ready:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 },
    );
  }
};
