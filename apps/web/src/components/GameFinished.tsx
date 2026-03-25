"use client";

import type { GameState } from "@rps/shared";

interface Props {
  game: GameState;
  playerIndex: number;
  onPlayAgain: () => void;
}

const moveEmoji: Record<string, string> = {
  rock: "🪨",
  paper: "📄",
  scissors: "✂️",
};

export default function GameFinished({
  game,
  playerIndex,
  onPlayAgain,
}: Props) {
  const p1Score = game.players[0]?.score || 0;
  const p2Score = game.players[1]?.score || 0;
  const isDraw = p1Score === p2Score;
  const winnerIndex = p1Score > p2Score ? 0 : 1;
  const playerWon = winnerIndex === playerIndex;

  return (
    <div className="text-center animate-bounce-in w-full max-w-lg">
      <h2 className="font-fun text-3xl md:text-4xl mb-2 text-gray-400">
        Game Over!
      </h2>

      <div className="mb-6">
        {isDraw ? (
          <p className="font-fun text-5xl md:text-6xl text-rps-yellow">
            🤝 It&apos;s a Tie! 🤝
          </p>
        ) : playerWon ? (
          <p className="font-fun text-5xl md:text-6xl text-green-500">
            🏆 You Win! 🏆
          </p>
        ) : (
          <p className="font-fun text-5xl md:text-6xl text-rps-red">
            😢 You Lose! 😢
          </p>
        )}
      </div>

      <div className="flex justify-center gap-8 font-fun text-3xl mb-8">
        <span
          className={
            p1Score > p2Score
              ? "text-green-500"
              : p1Score < p2Score
                ? "text-rps-red"
                : "text-rps-yellow"
          }
        >
          {game.players[0]?.name}: {p1Score}
        </span>
        <span className="text-gray-300">-</span>
        <span
          className={
            p2Score > p1Score
              ? "text-green-500"
              : p2Score < p1Score
                ? "text-rps-red"
                : "text-rps-yellow"
          }
        >
          {game.players[1]?.name}: {p2Score}
        </span>
      </div>

      <div className="bg-gray-50 rounded-2xl p-6 mb-8 border-3 border-gray-100 shadow-sm">
        <h3 className="font-fun text-2xl text-gray-600 mb-4">Round by Round</h3>
        <div className="space-y-3">
          {game.roundResults.map((result) => {
            const roundWinnerName =
              result.winner === "draw"
                ? "Draw"
                : result.winner === "player1"
                  ? game.players[0]?.name
                  : game.players[1]?.name;

            return (
              <div
                key={result.round}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm"
              >
                <span className="font-fun text-lg text-gray-400">
                  Round {result.round}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{moveEmoji[result.moves[0]]}</span>
                  <span className="font-fun text-sm text-gray-300">vs</span>
                  <span className="text-2xl">{moveEmoji[result.moves[1]]}</span>
                </div>
                <span
                  className={`font-fun text-lg ${
                    result.winner === "draw"
                      ? "text-rps-yellow"
                      : (result.winner === "player1" && playerIndex === 0) ||
                          (result.winner === "player2" && playerIndex === 1)
                        ? "text-green-500"
                        : "text-rps-red"
                  }`}
                >
                  {roundWinnerName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onPlayAgain}
        className="game-btn bg-rps-blue hover:bg-rps-blue-dark text-white animate-pulse-glow"
      >
        Play Again
      </button>
    </div>
  );
}
