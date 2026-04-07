import { NextResponse } from "next/server";
import { authenticatePlayer, createPlayerToken } from "../../../../_lib/auth";
import { generateGameId, sanitizeGame } from "../../../../_lib/game.logic";
import {
  deleteGame,
  deleteTokensByGame,
  findTokenByGameAndPlayer,
  getGame,
  setGame,
  setPlayerToken,
} from "../../../../_lib/game.store";
import type { Game } from "../../../../_lib/game.types";
import {
  moveConnectionsToGame,
  sendToPlayer,
} from "../../../../_lib/sse-connections";

type RouteContext = { params: Promise<{ gameId: string }> };

export async function POST(request: Request, context: RouteContext) {
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

    const isAIGame = oldGame.aiDifficulty !== undefined;
    const newGameId = generateGameId();

    const tokenMapping: Array<{
      oldToken: string;
      newToken: string;
      playerIndex: number;
    }> = [];

    const newGame: Game = {
      id: newGameId,
      rounds: oldGame.rounds,
      currentRound: 0,
      players: oldGame.players.map((p) => ({
        id: p.id === "ai-bot" ? "ai-bot" : "",
        name: p.name,
        ready: p.id === "ai-bot",
        move: null,
        score: 0,
      })),
      roundResults: [],
      status: "waiting",
      ...(isAIGame && {
        aiDifficulty: oldGame.aiDifficulty,
        aiMoveHistory: oldGame.aiMoveHistory ?? [],
      }),
    };

    setGame(newGameId, newGame);

    // Issue new tokens for the new game
    for (let i = 0; i < oldGame.players.length; i++) {
      if (oldGame.players[i].id === "ai-bot") continue;

      const oldToken = findTokenByGameAndPlayer(gameId, i);
      if (!oldToken) continue;

      const newToken = createPlayerToken(newGameId, i);
      newGame.players[i].id = newToken;

      setPlayerToken(newToken, {
        gameId: newGameId,
        playerIndex: i,
        role: i === 0 ? "OWNER" : "GUEST",
      });

      tokenMapping.push({ oldToken, newToken, playerIndex: i });
    }

    moveConnectionsToGame(gameId, newGameId);

    // Send per-player rematch event with their new individual token
    const sanitizedGame = sanitizeGame(newGame);
    for (const { oldToken, newToken } of tokenMapping) {
      sendToPlayer(newGameId, oldToken, "rematch-game-created", {
        gameId: newGameId,
        game: sanitizedGame,
        playerToken: newToken,
      });
    }

    deleteTokensByGame(gameId);
    deleteGame(gameId);

    console.log(`Rematch game ${newGameId} created from ${gameId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error on rematch-accepted:", error);
    return NextResponse.json(
      { error: "Failed to create rematch game" },
      { status: 500 },
    );
  }
}
