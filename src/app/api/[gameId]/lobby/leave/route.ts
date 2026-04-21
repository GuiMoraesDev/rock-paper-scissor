import { NextResponse } from "next/server";
import { authenticatePlayer } from "../../../_lib/auth";
import { captureApiError } from "../../../_lib/capture-error";
import { sanitizeGame } from "../../../_lib/game.logic";
import {
  findGame,
  removeAllGameTokens,
  removeGame,
  removePlayerToken,
} from "../../../_lib/game.repository";
import {
  broadcastToGame,
  removeConnection,
  removeGameConnections,
} from "../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export const POST = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticatePlayer(request, gameId, ["OWNER", "GUEST"]);
  if (!auth.success) return auth.response;

  const { meta, token } = auth;

  try {
    const game = findGame(gameId);
    if (!game) {
      return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    const playerName = game.players[meta.playerIndex]?.name ?? "Unknown player";
    const isCreator = meta.role === "OWNER";

    if (isCreator) {
      broadcastToGame(gameId, "player-disconnected", { playerName });
      removeAllGameTokens(gameId);
      removeGame(gameId);
      removeGameConnections(gameId);
      console.log(`${playerName} destroyed game ${gameId}`);
    } else {
      game.players.splice(meta.playerIndex, 1);
      game.status = "waiting";
      removePlayerToken(token);
      removeConnection(gameId, token);
      broadcastToGame(gameId, "game-updated", {
        game: sanitizeGame({ game }),
      });
      console.log(`${playerName} left game ${gameId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureApiError({ error, context: { gameId } });
    console.error("Error on leave-game:", error);
    return NextResponse.json(
      { error: "Failed to leave game" },
      { status: 500 },
    );
  }
};
