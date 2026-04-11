"use client";

import type { Move } from "@rps/shared";
import clsx from "clsx";
import { motion } from "framer-motion";
import { useState } from "react";
import { moveEmojiMap } from "@/lib/gameplay";
import { useGame } from "../../../../../provider/GameProvider";
import { MOVES_OPTIONS } from "../../constants/gameplay";

export function GamePlay() {
  const { game, playerIndex, handleMove, isMovePending } = useGame();
  const [selectedMove, setSelectedMove] = useState<Move | null>(null);

  if (!game) return null;

  const hasChosen = game.players[playerIndex]?.hasChosen;
  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const opponentHasChosen = game.players[opponentIndex]?.hasChosen;

  const onMove = (move: Move) => {
    if (hasChosen || isMovePending) return;

    setSelectedMove(move);
    handleMove(move);
  };

  return (
    <section
      data-testid="gameplay-screen"
      className="flex flex-col items-center gap-8 text-center w-full max-w-2xl"
    >
      <header className="flex flex-col gap-2">
        <p className="font-fun text-lg text-gray-400">
          Round {game.currentRound} of {game.rounds}
        </p>

        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-fun text-3xl md:text-5xl text-gray-800"
        >
          Make your move!
        </motion.h2>

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

      {/* Arena */}
      <div className="flex justify-center items-center gap-6 md:gap-12 w-full py-4">
        <motion.div
          animate={
            hasChosen && !opponentHasChosen
              ? { rotate: [-3, 3, -3], y: [-4, 4, -4] }
              : {}
          }
          transition={{ duration: 0.4, repeat: Infinity }}
          className={clsx(
            "flex flex-col items-center gap-2",
            "bg-gray-50 rounded-2xl p-6 border-3",
            hasChosen ? "border-rps-blue shadow-md" : "border-gray-200",
          )}
        >
          <span className="font-fun text-sm text-gray-500">
            {game.players[playerIndex]?.name}
          </span>
          <span className="text-5xl md:text-6xl">
            {hasChosen && selectedMove ? moveEmojiMap[selectedMove] : "???"}
          </span>
        </motion.div>

        <span className="font-fun text-2xl text-gray-300">VS</span>

        <motion.div
          animate={
            opponentHasChosen && !hasChosen
              ? {}
              : hasChosen
                ? { rotate: [-3, 3, -3], y: [-4, 4, -4] }
                : {}
          }
          transition={{ duration: 0.4, repeat: Infinity }}
          className={clsx(
            "flex flex-col items-center gap-2",
            "bg-gray-50 rounded-2xl p-6 border-3",
            opponentHasChosen ? "border-rps-blue shadow-md" : "border-gray-200",
          )}
        >
          <span className="font-fun text-sm text-gray-500">
            {game.players[opponentIndex]?.name}
          </span>
          <span className="text-5xl md:text-6xl">
            {opponentHasChosen ? "✅" : "???"}
          </span>
        </motion.div>
      </div>

      {/* Move Buttons */}
      <div className="flex justify-center gap-4 md:gap-8">
        {MOVES_OPTIONS.map((move, idx) => (
          <motion.button
            type="button"
            key={move}
            data-testid={`move-${move}`}
            disabled={hasChosen || isMovePending}
            onClick={() => onMove(move)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={!hasChosen ? { scale: 1.15 } : {}}
            whileTap={!hasChosen ? { scale: 0.9 } : {}}
            className={clsx(
              "text-5xl md:text-7xl",
              "w-20 h-20 md:w-28 md:h-28",
              "flex items-center justify-center",
              "rounded-full",
              "transition-all duration-200",
              "cursor-pointer",
              "bg-gray-50 border-3 border-gray-200 hover:border-gray-300",
              "shadow-md hover:shadow-lg",
              hasChosen &&
                selectedMove === move &&
                "border-rps-blue bg-blue-50",
              hasChosen &&
                selectedMove !== move &&
                "opacity-30 cursor-not-allowed",
              "disabled:cursor-not-allowed",
            )}
          >
            {moveEmojiMap[move]}
          </motion.button>
        ))}
      </div>

      <footer className="flex flex-col gap-2">
        {hasChosen && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-fun text-xl text-green-500"
          >
            ✅ You chose {selectedMove}!
          </motion.p>
        )}
        {opponentHasChosen ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-fun text-xl text-green-500"
          >
            ✅ Opponent has chosen!
          </motion.p>
        ) : (
          <motion.p
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="font-fun text-xl text-gray-400"
          >
            ⏳ Waiting for opponent...
          </motion.p>
        )}
      </footer>
    </section>
  );
}
