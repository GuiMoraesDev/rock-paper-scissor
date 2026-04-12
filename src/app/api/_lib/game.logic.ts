import { hasGame } from "./game.store";
import type { Game } from "./game.types";

export function generateGameId(): string {
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
