import type { Game } from "./types.js";

export function generateGameId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export function resolveRound(
  move1: string,
  move2: string,
): "player1" | "player2" | "draw" {
  if (move1 === move2) return "draw";
  if (
    (move1 === "rock" && move2 === "scissors") ||
    (move1 === "scissors" && move2 === "paper") ||
    (move1 === "paper" && move2 === "rock")
  ) {
    return "player1";
  }
  return "player2";
}

const MOVES = ["rock", "paper", "scissors"] as const;

const COUNTER_MOVE: Record<string, string> = {
  rock: "paper",
  paper: "scissors",
  scissors: "rock",
};

function predictMostFrequentMove(history: string[]): string | null {
  if (history.length === 0) return null;

  const frequency: Record<string, number> = {};
  for (const move of history) {
    frequency[move] = (frequency[move] || 0) + 1;
  }

  let maxCount = 0;
  let mostFrequent: string | null = null;
  for (const [move, count] of Object.entries(frequency)) {
    if (count > maxCount) {
      maxCount = count;
      mostFrequent = move;
    }
  }

  return mostFrequent;
}

export function generateAIMove(
  difficulty: "easy" | "normal" | "hard",
  moveHistory: string[],
): string {
  const random = MOVES[Math.floor(Math.random() * MOVES.length)];

  if (difficulty === "easy") {
    return random;
  }

  const predicted = predictMostFrequentMove(moveHistory);
  if (!predicted) return random;

  if (difficulty === "normal") {
    return Math.random() < 0.5 ? COUNTER_MOVE[predicted] : random;
  }

  // hard: 80% counter based on full history prediction
  return Math.random() < 0.8 ? COUNTER_MOVE[predicted] : random;
}

export function sanitizeGame(game: Game) {
  return {
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
  };
}

export function sanitizeGameFull(game: Game) {
  return {
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
  };
}
