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

export function generateAIMove(
  difficulty: "easy" | "normal" | "hard",
  opponentMove: string,
): string {
  const random = MOVES[Math.floor(Math.random() * MOVES.length)];

  if (difficulty === "easy") {
    return random;
  }

  if (difficulty === "normal") {
    return Math.random() < 0.33 ? COUNTER_MOVE[opponentMove] : random;
  }

  // hard: 70% counter
  return Math.random() < 0.7 ? COUNTER_MOVE[opponentMove] : random;
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
