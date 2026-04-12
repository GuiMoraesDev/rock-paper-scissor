import { NextResponse } from "next/server";
import { createPlayerToken } from "../_lib/auth";
import { captureApiError } from "../_lib/capture-error";
import { sanitizeGame } from "../_lib/game.logic";
import { getGame, setPlayerToken } from "../_lib/game.store";
import { broadcastToGame } from "../_lib/sse-connections";

export const POST = async (request: Request) => {
  try {
    const { gameId, playerName } = await request.json();

    if (!gameId || typeof gameId !== "string") {
      return NextResponse.json(
        { error: "Game ID is required" },
        { status: 400 },
      );
    }

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 },
      );
    }

    const normalizedGameId = gameId.toUpperCase();
    const game = getGame(normalizedGameId);

    if (!game) {
      return NextResponse.json({ error: "Game not found!" }, { status: 404 });
    }

    if (game.players.length >= 2) {
      return NextResponse.json({ error: "Game is full!" }, { status: 409 });
    }

    if (game.status !== "waiting") {
      return NextResponse.json(
        { error: "Game already started!" },
        { status: 409 },
      );
    }

    const playerToken = createPlayerToken(normalizedGameId, 1);

    game.players.push({
      id: playerToken,
      name: playerName,
      ready: false,
      move: null,
      score: 0,
    });

    setPlayerToken(playerToken, {
      gameId: normalizedGameId,
      playerIndex: 1,
      role: "GUEST",
    });

    // Notify existing players via SSE
    broadcastToGame(normalizedGameId, "game-updated", {
      game: sanitizeGame({ game }),
    });

    console.log(`${playerName} joined game ${normalizedGameId}`);

    return NextResponse.json({
      gameId: normalizedGameId,
      playerToken,
      game: sanitizeGame({ game }),
    });
  } catch (error) {
    captureApiError({ error });
    console.error("Error joining game:", error);
    return NextResponse.json({ error: "Failed to join game" }, { status: 500 });
  }
};
