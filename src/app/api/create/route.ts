import { NextResponse } from "next/server";
import { createPlayerToken } from "../_lib/auth";
import { captureApiError } from "../_lib/capture-error";
import { generateGameId, sanitizeGame } from "../_lib/game.logic";
import { saveGame, savePlayerToken } from "../_lib/game.repository";
import type { Game } from "../_lib/game.types";

export const POST = async (request: Request) => {
  try {
    const { playerName, rounds } = await request.json();

    if (!playerName || typeof playerName !== "string") {
      return NextResponse.json(
        { error: "Player name is required" },
        { status: 400 },
      );
    }

    if (![1, 3, 5].includes(rounds)) {
      return NextResponse.json(
        { error: "Rounds must be 1, 3, or 5" },
        { status: 400 },
      );
    }

    const gameId = generateGameId();
    const playerToken = createPlayerToken(gameId, 0);

    const game: Game = {
      id: gameId,
      rounds,
      currentRound: 0,
      players: [
        {
          id: playerToken,
          name: playerName,
          ready: false,
          move: null,
          score: 0,
        },
      ],
      roundResults: [],
      status: "waiting",
    };

    saveGame(gameId, game);
    savePlayerToken(playerToken, {
      gameId,
      playerIndex: 0,
      role: "OWNER",
    });

    console.log(`Game ${gameId} created by ${playerName}`);

    return NextResponse.json({
      gameId,
      playerToken,
      game: sanitizeGame({ game }),
    });
  } catch (error) {
    captureApiError({ error });
    console.error("Error creating game:", error);
    return NextResponse.json(
      { error: "Failed to create game" },
      { status: 500 },
    );
  }
};
