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
