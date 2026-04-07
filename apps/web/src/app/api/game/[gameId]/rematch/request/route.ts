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

function createRematchGame(oldGame: Game, oldGameId: string) {
  const isAIGame = oldGame.aiDifficulty !== undefined;
  const newGameId = generateGameId();

  // Map old tokens to new tokens for SSE notification
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

    const oldToken = findTokenByGameAndPlayer(oldGameId, i);
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

  // Move SSE connections from old game to new game
  moveConnectionsToGame(oldGameId, newGameId);

  // Send per-player rematch event with their new individual token
  const sanitizedGame = sanitizeGame(newGame);
  for (const { oldToken, newToken } of tokenMapping) {
    // After moveConnectionsToGame, connections are keyed by oldToken in the new game room
    sendToPlayer(newGameId, oldToken, "rematch-game-created", {
      gameId: newGameId,
      game: sanitizedGame,
      playerToken: newToken,
    });
  }

  // Clean up old game tokens and game
  deleteTokensByGame(oldGameId);
  deleteGame(oldGameId);

  console.log(`Rematch game ${newGameId} created from ${oldGameId}`);
}

type RouteContext = { params: Promise<{ gameId: string }> };

export async function POST(request: Request, context: RouteContext) {
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
      createRematchGame(game, gameId);
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
    console.error("Error on request-rematch:", error);
    return NextResponse.json(
      { error: "Failed to request rematch" },
      { status: 500 },
    );
  }
}
