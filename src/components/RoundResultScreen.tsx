"use client";

import { GameState, RoundResult } from "@/lib/types";

interface Props {
  game: GameState;
  playerIndex: number;
  roundResult: RoundResult;
  onNextRound: () => void;
  isLastRound: boolean;
}

const moveEmoji: Record<string, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export default function RoundResultScreen({
  game,
  playerIndex,
  roundResult,
  onNextRound,
  isLastRound,
}: Props) {
  const playerWon =
    (playerIndex === 0 && roundResult.winner === "player1") ||
    (playerIndex === 1 && roundResult.winner === "player2");
  const isDraw = roundResult.winner === "draw";

  return (
    <div className="text-center animate-bounce-in w-full max-w-lg">
      <p className="font-fun text-lg text-white/50 mb-2">
        Round {roundResult.round} Result
      </p>

      <h2
        className={`font-fun text-5xl md:text-6xl mb-8 ${
          isDraw
            ? "text-yellow-400"
            : playerWon
            ? "text-green-400"
            : "text-red-400"
        }`}
      >
        {isDraw ? "It's a Draw!" : playerWon ? "You Win!" : "You Lose!"}
      </h2>

      <div className="flex justify-center items-center gap-8 mb-8">
        <div className="text-center">
          <p className="font-fun text-lg text-white/60 mb-2">
            {game.players[0]?.name}
          </p>
          <div className="text-6xl md:text-7xl animate-bounce-in">
            {moveEmoji[roundResult.moves[0]]}
          </div>
        </div>

        <span className="font-fun text-3xl text-white/40">VS</span>

        <div className="text-center">
          <p className="font-fun text-lg text-white/60 mb-2">
            {game.players[1]?.name}
          </p>
          <div className="text-6xl md:text-7xl animate-bounce-in">
            {moveEmoji[roundResult.moves[1]]}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8 font-fun text-2xl text-white/70 mb-8">
        <span>
          {game.players[0]?.name}: {game.players[0]?.score}
        </span>
        <span>-</span>
        <span>
          {game.players[1]?.name}: {game.players[1]?.score}
        </span>
      </div>

      {!isLastRound && (
        <button
          onClick={onNextRound}
          className="game-btn bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse-glow"
        >
          Next Round →
        </button>
      )}
    </div>
  );
}
