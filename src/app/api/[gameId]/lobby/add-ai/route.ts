import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../_lib/auth";
import { captureApiError } from "../../../_lib/capture-error";
import { sanitizeGame } from "../../../_lib/game.logic";
import { findGame } from "../../../_lib/game.repository";
import { broadcastToGame } from "../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER"]);
  if (!auth.success) return auth.response;

  try {
    const { difficulty, moveHistory } = await request.json();

    if (!["easy", "normal", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty" },
        { status: 400 },
      );
    }

    const game = findGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    if (game.players.length >= 2) {
      return NextResponse.json({ error: "Game is full" }, { status: 409 });
    }

    if (game.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started" },
        { status: 409 },
      );
    }

    game.players.push({
      id: "ai-bot",
      name: `AI (${difficulty})`,
      ready: true,
      move: null,
      score: 0,
    });
    game.aiDifficulty = difficulty;
    game.aiMoveHistory = Array.isArray(moveHistory) ? moveHistory : [];

    broadcastToGame(gameId, "game-updated", {
      game: sanitizeGame({ game }),
    });

    console.log(`AI (${difficulty}) added to game ${gameId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError({ error, context: { gameId } });
    console.error("Error adding AI player:", error);
    return NextResponse.json(
      { error: "Failed to add AI player" },
      { status: 500 },
    );
  }
};
