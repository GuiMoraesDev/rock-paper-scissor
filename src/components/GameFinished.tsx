"use client";

import { GameState } from "@/lib/types";

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

export default function GameFinished({ game, playerIndex, onPlayAgain }: Props) {
  const p1Score = game.players[0]?.score || 0;
  const p2Score = game.players[1]?.score || 0;
  const isDraw = p1Score === p2Score;
  const winnerIndex = p1Score > p2Score ? 0 : 1;
  const playerWon = winnerIndex === playerIndex;

  return (
    <div className="text-center animate-bounce-in w-full max-w-lg">
      <h2 className="font-fun text-3xl md:text-4xl mb-2 text-white/50">
        Game Over!
      </h2>

      <div className="mb-6">
        {isDraw ? (
          <p className="font-fun text-5xl md:text-6xl text-yellow-400">
            🤝 It&apos;s a Tie! 🤝
          </p>
        ) : playerWon ? (
          <p className="font-fun text-5xl md:text-6xl text-green-400">
            🏆 You Win! 🏆
          </p>
        ) : (
          <p className="font-fun text-5xl md:text-6xl text-red-400">
            😢 You Lose! 😢
          </p>
        )}
      </div>

      <div className="flex justify-center gap-8 font-fun text-3xl mb-8">
        <span className={p1Score > p2Score ? "text-green-400" : p1Score < p2Score ? "text-red-400" : "text-yellow-400"}>
          {game.players[0]?.name}: {p1Score}
        </span>
        <span className="text-white/40">-</span>
        <span className={p2Score > p1Score ? "text-green-400" : p2Score < p1Score ? "text-red-400" : "text-yellow-400"}>
          {game.players[1]?.name}: {p2Score}
        </span>
      </div>

      <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/10">
        <h3 className="font-fun text-2xl text-white/70 mb-4">
          Round by Round
        </h3>
        <div className="space-y-3">
          {game.roundResults.map((result, idx) => {
            const roundWinnerName =
              result.winner === "draw"
                ? "Draw"
                : result.winner === "player1"
                ? game.players[0]?.name
                : game.players[1]?.name;

            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
              >
                <span className="font-fun text-lg text-white/50">
                  Round {result.round}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{moveEmoji[result.moves[0]]}</span>
                  <span className="font-fun text-sm text-white/30">vs</span>
                  <span className="text-2xl">{moveEmoji[result.moves[1]]}</span>
                </div>
                <span
                  className={`font-fun text-lg ${
                    result.winner === "draw"
                      ? "text-yellow-400"
                      : (result.winner === "player1" && playerIndex === 0) ||
                        (result.winner === "player2" && playerIndex === 1)
                      ? "text-green-400"
                      : "text-red-400"
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
        onClick={onPlayAgain}
        className="game-btn bg-gradient-to-r from-purple-600 to-pink-600 text-white animate-pulse-glow"
      >
        🎮 Play Again
      </button>
    </div>
  );
}
