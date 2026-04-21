import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../_lib/auth";
import { captureApiError } from "../../../_lib/capture-error";
import { sanitizeGame } from "../../../_lib/game.logic";
import {
  findGame,
  findTokenByPlayer,
  removePlayerToken,
} from "../../../_lib/game.repository";
import {
  broadcastToGame,
  removeConnection,
  sendToPlayer,
} from "../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER"]);
  if (!auth.success) return auth.response;

  try {
    const game = findGame(gameId);
    if (!game || game.players.length < 2) {
      return NextResponse.json({ error: "No player to kick" }, { status: 409 });
    }

    if (game.status !== "waiting") {
      return NextResponse.json(
        { error: "Cannot kick during active game" },
        { status: 409 },
      );
    }

    const kicked = game.players[1];
    const kickedToken = findTokenByPlayer(gameId, 1);

    game.players.splice(1, 1);

    if (kickedToken) {
      sendToPlayer(gameId, kickedToken, "player-kicked", {
        message: "You have been kicked from the game.",
      });
      removeConnection(gameId, kickedToken);
      removePlayerToken(kickedToken);
    }

    broadcastToGame(gameId, "game-updated", {
      game: sanitizeGame({ game }),
    });

    console.log(`${kicked.name} was kicked from game ${gameId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError({ error, context: { gameId } });
    console.error("Error on kick-player:", error);
    return NextResponse.json(
      { error: "Failed to kick player" },
      { status: 500 },
    );
  }
};
