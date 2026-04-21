export const SSEEvents = {
  GAME_STATE: "game-state",
  GAME_UPDATED: "game-updated",
  ROUND_RESULT: "round-result",
  GAME_FINISHED: "game-finished",
  ERROR_MSG: "error-msg",
  PLAYER_DISCONNECTED: "player-disconnected",
  PLAYER_KICKED: "player-kicked",
  REMATCH_REQUESTED: "rematch-requested",
  REMATCH_DENIED: "rematch-denied",
  REMATCH_GAME_CREATED: "rematch-game-created",
} as const;

export type Move = "rock" | "paper" | "scissors";

export type AIDifficulty = "easy" | "normal" | "hard";

export type Player = {
  name: string;
  ready: boolean;
  score: number;
  hasChosen: boolean;
  move?: Move;
};

export type RoundResult = {
  round: number;
  moves: [Move, Move];
  winner: "player1" | "player2" | "draw";
};

export type GameState = {
  id: string;
  rounds: number;
  currentRound: number;
  status: "waiting" | "ready" | "playing" | "round-result" | "finished";
  players: Player[];
  roundResults: RoundResult[];
  winner?: "player1" | "player2" | "draw";
};
