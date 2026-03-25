import type { Move } from "@rps/shared";

export const MOVES_OPTIONS: Array<Move> = ["rock", "paper", "scissors"];

export const moveEmojiMap = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
} as const;
