"use client";

import { GameState, RoundResult } from "@rps/shared";

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
      <p className="font-fun text-lg text-gray-400 mb-2">
        Round {roundResult.round} Result
      </p>

      <h2
        className={`font-fun text-5xl md:text-6xl mb-8 ${
          isDraw
            ? "text-rps-yellow"
            : playerWon
            ? "text-green-500"
            : "text-rps-red"
        }`}
      >
        {isDraw ? "It's a Draw!" : playerWon ? "You Win!" : "You Lose!"}
      </h2>

      <div className="flex justify-center items-center gap-8 mb-8">
        <div className="text-center">
          <p className="font-fun text-lg text-gray-500 mb-2">
            {game.players[0]?.name}
          </p>
          <div className="text-6xl md:text-7xl animate-bounce-in">
            {moveEmoji[roundResult.moves[0]]}
          </div>
        </div>

        <span className="font-fun text-3xl text-gray-300">VS</span>

        <div className="text-center">
          <p className="font-fun text-lg text-gray-500 mb-2">
            {game.players[1]?.name}
          </p>
          <div className="text-6xl md:text-7xl animate-bounce-in">
            {moveEmoji[roundResult.moves[1]]}
          </div>
        </div>
      </div>

      <div className="flex justify-center gap-8 font-fun text-2xl text-gray-600 mb-8">
        <span>
          {game.players[0]?.name}: {game.players[0]?.score}
        </span>
        <span className="text-gray-300">-</span>
        <span>
          {game.players[1]?.name}: {game.players[1]?.score}
        </span>
      </div>

      {!isLastRound && (
        <button
          onClick={onNextRound}
          className="game-btn bg-rps-blue hover:bg-rps-blue-dark text-white animate-pulse-glow"
        >
          Next Round →
        </button>
      )}
    </div>
  );
}
