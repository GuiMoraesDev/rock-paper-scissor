import { createPlayerToken } from "./auth";
import {
  deleteGame,
  deleteTokensByGame,
  findTokenByGameAndPlayer,
  hasGame,
  setGame,
  setPlayerToken,
} from "./game.store";
import type { Game } from "./game.types";
import { moveConnectionsToGame, sendToPlayer } from "./sse-connections";

export const VALID_MOVES = ["rock", "paper", "scissors"] as const;

export const generateGameId = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let id = "";
    for (let i = 0; i < 6; i++) {
      id += chars[Math.floor(Math.random() * chars.length)];
    }
    if (!hasGame(id)) return id;
  }

  throw new Error("Failed to generate unique game ID after maximum attempts");
};

type ResolveRoundParams = { move1: string; move2: string };

export const resolveRound = ({
  move1,
  move2,
}: ResolveRoundParams): "player1" | "player2" | "draw" => {
  if (move1 === move2) return "draw";
  if (
    (move1 === "rock" && move2 === "scissors") ||
    (move1 === "scissors" && move2 === "paper") ||
    (move1 === "paper" && move2 === "rock")
  ) {
    return "player1";
  }
  return "player2";
};

type SanitizeGameParams = { game: Game };

export const sanitizeGame = ({ game }: SanitizeGameParams) => ({
  id: game.id,
  rounds: game.rounds,
  currentRound: game.currentRound,
  status: game.status,
  roundResults: game.roundResults,
  winner: game.winner,
  players: game.players.map((p) => ({
    name: p.name,
    ready: p.ready,
    score: p.score,
    hasChosen: !!p.move,
  })),
});

export const sanitizeGameFull = ({ game }: SanitizeGameParams) => ({
  id: game.id,
  rounds: game.rounds,
  currentRound: game.currentRound,
  status: game.status,
  roundResults: game.roundResults,
  winner: game.winner,
  players: game.players.map((p) => ({
    name: p.name,
    ready: p.ready,
    score: p.score,
    move: p.move,
    hasChosen: !!p.move,
  })),
});

type GetAIMoveHistoryParams = { game: Game };

export const getAIMoveHistory = ({
  game,
}: GetAIMoveHistoryParams): string[] => {
  const currentGameMoves = game.roundResults.map((r) => r.moves[0]);
  const pastMoves = game.aiMoveHistory ?? [];

  if (game.aiDifficulty === "normal") {
    return currentGameMoves;
  }

  return [...pastMoves, ...currentGameMoves];
};

type TokenMapping = { oldToken: string; newToken: string; playerIndex: number };

type CreateRematchGameParams = { oldGame: Game; oldGameId: string };

export const createRematchGame = ({
  oldGame,
  oldGameId,
}: CreateRematchGameParams): void => {
  const isAIGame = oldGame.aiDifficulty !== undefined;
  const newGameId = generateGameId();

  const tokenMapping: TokenMapping[] = [];

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
  const sanitizedGame = sanitizeGame({ game: newGame });
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
};
