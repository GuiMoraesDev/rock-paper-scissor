export const SocketEvents = {
  CREATE_GAME: "create-game",
  JOIN_GAME: "join-game",
  PLAYER_READY: "player-ready",
  MAKE_MOVE: "make-move",
  NEXT_ROUND: "next-round",
  REQUEST_GAME_STATE: "request-game-state",
  GAME_CREATED: "game-created",
  JOINED_GAME: "joined-game",
  GAME_UPDATED: "game-updated",
  ROUND_RESULT: "round-result",
  GAME_FINISHED: "game-finished",
  GAME_STATE_RESPONSE: "game-state-response",
  ERROR_MSG: "error-msg",
  PLAYER_DISCONNECTED: "player-disconnected",
} as const;

export type Move = "rock" | "paper" | "scissors";

export interface Player {
  name: string;
  ready: boolean;
  score: number;
  hasChosen: boolean;
  move?: Move;
}

export interface RoundResult {
  round: number;
  moves: [Move, Move];
  winner: "player1" | "player2" | "draw";
}

export interface GameState {
  id: string;
  rounds: number;
  currentRound: number;
  status: "waiting" | "ready" | "playing" | "round-result" | "finished";
  players: Player[];
  roundResults: RoundResult[];
}
