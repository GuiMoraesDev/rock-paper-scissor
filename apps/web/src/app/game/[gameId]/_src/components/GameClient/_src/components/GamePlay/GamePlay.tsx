"use client";

import type { Move } from "@rps/shared";
import clsx from "clsx";
import { useState } from "react";
import { useGame } from "../../../../../provider/GameProvider";
import { MOVES_OPTIONS, moveEmojiMap } from "../../constants/gameplay";

export function GamePlay() {
  const { game, playerIndex, handleMove } = useGame();
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  if (!game) return null;

  const hasChosen = game.players[playerIndex]?.hasChosen;
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponentHasChosen = game.players[opponentIndex]?.hasChosen;

  const onMove = (move: Move) => {
    if (hasChosen) return;

    setSelectedMove(move);
    handleMove(move);
  };

  return (
    <section className="flex flex-col items-center gap-8 text-center animate-bounce-in w-full max-w-2xl">
      <header className="flex flex-col gap-2">
        <p className="font-fun text-lg text-gray-400">
          Round {game.currentRound} of {game.rounds}
        </p>

        <h2 className="font-fun text-3xl md:text-5xl text-gray-800">
          Make your move!
        </h2>

        <div className="flex justify-center gap-8 font-fun text-lg text-gray-500">
          <p>
            {game.players[0]?.name}: {game.players[0]?.score}
          </p>
          <p>vs</p>
          <p>
            {game.players[1]?.name}: {game.players[1]?.score}
          </p>
        </div>
      </header>

      <div className="flex justify-center gap-4 md:gap-8">
        {MOVES_OPTIONS.map((move) => (
          <button
            type="button"
            key={move}
            disabled={hasChosen}
            onClick={() => onMove(move)}
            className={clsx(
              "text-6xl md:text-8xl",
              "p-4 md:p-6 rounded-3xl",
              "transition-all duration-200",
              "transform hover:scale-110 active:scale-95",
              "cursor-pointer",
              "bg-gray-50 border-3 border-gray-200 hover:border-gray-300",
              "shadow-md hover:shadow-lg",
            )}
          >
            {moveEmojiMap[move]}
          </button>
        ))}
      </div>

      <footer className="flex flex-col gap-2">
        {hasChosen && (
          <p className="font-fun text-xl text-green-500">
            ✅ You chose {selectedMove}!
          </p>
        )}
        {opponentHasChosen ? (
          <p className="font-fun text-xl text-green-500">
            ✅ Opponent has chosen!
          </p>
        ) : (
          <p className="font-fun text-xl text-gray-400 animate-pulse">
            ⏳ Waiting for opponent...
          </p>
        )}
      </footer>
    </section>
  );
}
