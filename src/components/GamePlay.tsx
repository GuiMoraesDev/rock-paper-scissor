"use client";

import { useState } from "react";
import { GameState, Move } from "@/lib/types";

interface Props {
  game: GameState;
  playerIndex: number;
  onMove: (move: Move) => void;
}

const moves: { move: Move; emoji: string; label: string }[] = [
  { move: "rock", emoji: "🪨", label: "Rock" },
  { move: "paper", emoji: "📄", label: "Paper" },
  { move: "scissors", emoji: "✂️", label: "Scissors" },
];

export default function GamePlay({ game, playerIndex, onMove }: Props) {
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);
  const hasChosen = game.players[playerIndex]?.hasChosen;
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponentHasChosen = game.players[opponentIndex]?.hasChosen;

  const handleMove = (move: Move) => {
    if (hasChosen) return;
    setSelectedMove(move);
    onMove(move);
  };

  return (
    <div className="text-center animate-bounce-in w-full max-w-2xl">
      <div className="mb-4">
        <p className="font-fun text-lg text-white/50">
          Round {game.currentRound} of {game.rounds}
        </p>
        <h2 className="font-fun text-3xl md:text-5xl text-yellow-400 mb-2">
          Make your move!
        </h2>
        <div className="flex justify-center gap-8 font-fun text-lg text-white/60">
          <span>
            {game.players[0]?.name}: {game.players[0]?.score}
          </span>
          <span>vs</span>
          <span>
            {game.players[1]?.name}: {game.players[1]?.score}
          </span>
        </div>
      </div>

      <div className="flex justify-center gap-4 md:gap-8 mb-8 mt-8">
        {moves.map(({ move, emoji, label }) => (
          <button
            key={move}
            onClick={() => handleMove(move)}
            disabled={hasChosen}
            className={`emoji-btn ${
              selectedMove === move
                ? "border-yellow-400 bg-yellow-400/20 scale-110"
                : ""
            } ${hasChosen && selectedMove !== move ? "opacity-30" : ""}
              disabled:cursor-default`}
            title={label}
          >
            <span className="block">{emoji}</span>
            <span className="font-fun text-base md:text-lg mt-2 block">
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {hasChosen && (
          <p className="font-fun text-xl text-green-400">
            ✅ You chose {selectedMove}!
          </p>
        )}
        {opponentHasChosen ? (
          <p className="font-fun text-xl text-green-400">
            ✅ Opponent has chosen!
          </p>
        ) : (
          <p className="font-fun text-xl text-white/40 animate-pulse">
            ⏳ Waiting for opponent...
          </p>
        )}
      </div>
    </div>
  );
}
