"use client";

import { useState } from "react";
import { GameState, Move } from "@rps/shared";
import { moveEmojiVariants } from "@/app/game/[gameId]/_src/components/MoveEmoji";

interface Props {
  game: GameState;
  playerIndex: number;
  onMove: (move: Move) => void;
}

const moves: { move: Move; emoji: string; label: string; color: string; selectedBorder: string; selectedBg: string }[] = [
  { move: "rock", emoji: "🪨", label: "Rock", color: "rps-blue", selectedBorder: "border-rps-blue", selectedBg: "bg-rps-blue/10" },
  { move: "paper", emoji: "📄", label: "Paper", color: "rps-yellow", selectedBorder: "border-rps-yellow", selectedBg: "bg-rps-yellow/10" },
  { move: "scissors", emoji: "✂️", label: "Scissors", color: "rps-red", selectedBorder: "border-rps-red", selectedBg: "bg-rps-red/10" },
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
        <p className="font-fun text-lg text-gray-400">
          Round {game.currentRound} of {game.rounds}
        </p>
        <h2 className="font-fun text-3xl md:text-5xl text-gray-800 mb-2">
          Make your move!
        </h2>
        <div className="flex justify-center gap-8 font-fun text-lg text-gray-500">
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
        {moves.map(({ move, emoji, label, selectedBorder, selectedBg }) => (
          <button
            key={move}
            onClick={() => handleMove(move)}
            disabled={hasChosen}
            className={moveEmojiVariants({
              interactive: true,
              className: [
                selectedMove === move && `${selectedBorder} ${selectedBg} scale-110`,
                hasChosen && selectedMove !== move && "opacity-30",
                "disabled:cursor-default",
              ],
            })}
            title={label}
          >
            <span className="block">{emoji}</span>
            <span className="font-fun text-base md:text-lg mt-2 block text-gray-600">
              {label}
            </span>
          </button>
        ))}
      </div>

      <div className="space-y-2">
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
      </div>
    </div>
  );
}
