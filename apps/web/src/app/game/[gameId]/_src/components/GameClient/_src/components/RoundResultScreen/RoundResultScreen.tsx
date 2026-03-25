"use client";

import clsx from "clsx";
import { useGame } from "../../../../../provider/GameProvider";
import { moveEmojiMap } from "../../constants/gameplay";

export function RoundResultScreen() {
  const { game, playerIndex, lastRoundResult, handleNextRound } = useGame();

  if (!game || !lastRoundResult) return null;

  const playerWon =
    (playerIndex === 0 && lastRoundResult.winner === "player1") ||
    (playerIndex === 1 && lastRoundResult.winner === "player2");
  const isDraw = lastRoundResult.winner === "draw";
  const isLastRound = game.currentRound >= game.rounds;

  return (
    <section className="flex flex-col items-center gap-8 text-center animate-bounce-in w-full max-w-lg">
      <header className="flex flex-col gap-2">
        <p className="font-fun text-lg text-gray-400">
          Round {lastRoundResult.round} Result
        </p>

        <h2
          className={clsx(
            "font-fun text-5xl md:text-6xl",
            isDraw && "text-rps-yellow",
            !isDraw && playerWon && "text-green-500",
            !isDraw && !playerWon && "text-rps-red",
          )}
        >
          {isDraw ? "It's a Draw!" : playerWon ? "You Win!" : "You Lose!"}
        </h2>
      </header>

      <div className="flex justify-center items-center gap-8">
        <figure className="flex flex-col items-center gap-2">
          <figcaption className="font-fun text-lg text-gray-500">
            {game.players[0]?.name}
          </figcaption>
          <span className="text-6xl md:text-7xl animate-bounce-in">
            {moveEmojiMap[lastRoundResult.moves[0]]}
          </span>
        </figure>

        <span className="font-fun text-3xl text-gray-300">VS</span>

        <figure className="flex flex-col items-center gap-2">
          <figcaption className="font-fun text-lg text-gray-500">
            {game.players[1]?.name}
          </figcaption>
          <span className="text-6xl md:text-7xl animate-bounce-in">
            {moveEmojiMap[lastRoundResult.moves[1]]}
          </span>
        </figure>
      </div>

      <div className="flex justify-center gap-8 font-fun text-2xl text-gray-600">
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
          type="button"
          onClick={handleNextRound}
          className="game-btn bg-rps-blue hover:bg-rps-blue-dark text-white animate-pulse-glow"
        >
          Next Round →
        </button>
      )}
    </section>
  );
}
