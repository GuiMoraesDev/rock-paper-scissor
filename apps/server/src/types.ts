export type SocketMeta = {
  gameId: string;
  playerIndex: number;
};

export type ServerPlayer = {
  id: string;
  name: string;
  ready: boolean;
  move: string | null;
  score: number;
};

export type Game = {
  id: string;
  rounds: number;
  currentRound: number;
  players: ServerPlayer[];
  roundResults: RoundResult[];
  status: "waiting" | "ready" | "playing" | "round-result" | "finished";
  winner?: "player1" | "player2" | "draw";
  rematchRequestedBy?: number;
  aiDifficulty?: "easy" | "normal" | "hard";
  aiMoveHistory?: string[];
};

export type RoundResult = {
  round: number;
  moves: [string, string];
  winner: "player1" | "player2" | "draw";
};
