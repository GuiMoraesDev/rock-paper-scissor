import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../../_lib/auth";
import { captureApiError } from "../../../../_lib/capture-error";
import { createRematchGame } from "../../../../_lib/game.logic";
import { findTokenByGameAndPlayer, getGame } from "../../../../_lib/game.store";
import { sendToPlayer } from "../../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER", "GUEST"]);
  if (!auth.success) return auth.response;

  const { meta } = auth;

  try {
    const game = getGame(gameId);
    if (!game || game.status !== "finished") {
      return NextResponse.json(
        { error: "Game is not finished" },
        { status: 409 },
      );
    }

    // AI game: immediately create rematch
    if (game.aiDifficulty !== undefined) {
      createRematchGame({ oldGame: game, oldGameId: gameId });
      return NextResponse.json({ success: true });
    }

    // PvP game: notify opponent
    game.rematchRequestedBy = meta.playerIndex;
    const playerName = game.players[meta.playerIndex]?.name ?? "Unknown";

    const opponentIndex = meta.playerIndex === 0 ? 1 : 0;
    const opponentToken = findTokenByGameAndPlayer(gameId, opponentIndex);

    if (opponentToken) {
      sendToPlayer(gameId, opponentToken, "rematch-requested", {
        playerName,
      });
    }

    console.log(`${playerName} requested rematch in game ${gameId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError({ error, context: { gameId } });
    console.error("Error on request-rematch:", error);
    return NextResponse.json(
      { error: "Failed to request rematch" },
      { status: 500 },
    );
  }
};
