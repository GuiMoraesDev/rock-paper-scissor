import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../../_lib/auth";
import { captureApiError } from "../../../../_lib/capture-error";
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
    if (!game || game.rematchRequestedBy === undefined) {
      return NextResponse.json(
        { error: "No rematch request pending" },
        { status: 409 },
      );
    }

    const requesterToken = findTokenByGameAndPlayer(
      gameId,
      game.rematchRequestedBy,
    );

    if (requesterToken) {
      sendToPlayer(gameId, requesterToken, "rematch-denied", {
        playerName: game.players[meta.playerIndex]?.name ?? "Opponent",
      });
    }

    game.rematchRequestedBy = undefined;
    console.log(`Rematch denied in game ${gameId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError({ error, context: { gameId } });
    console.error("Error on rematch-denied:", error);
    return NextResponse.json(
      { error: "Failed to deny rematch" },
      { status: 500 },
    );
  }
};
