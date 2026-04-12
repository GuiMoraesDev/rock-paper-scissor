import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../../_lib/auth";
import { createRematchGame } from "../../../../_lib/game.logic";
import { getGame } from "../../../../_lib/game.store";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER", "GUEST"]);
  if (!auth.success) return auth.response;

  try {
    const oldGame = getGame(gameId);
    if (!oldGame || oldGame.rematchRequestedBy === undefined) {
      return NextResponse.json(
        { error: "No rematch request pending" },
        { status: 409 },
      );
    }

    createRematchGame({ oldGame, oldGameId: gameId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error on rematch-accepted:", error);
    return NextResponse.json(
      { error: "Failed to create rematch game" },
      { status: 500 },
    );
  }
};
