"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useMemo } from "react";
import { Button } from "@/components/atoms/Button";
import { useGame } from "../../../../../provider/GameProvider";
import { moveEmojiMap } from "../../constants/gameplay";

const WIN_MESSAGES = ["CRUSHED IT 💥", "LET'S GO 🔥", "TOO EASY 😎", "BOOM 💣"];
const LOSE_MESSAGES = ["Ouch 😅", "Try again 👀", "Not this time 💀", "Oof 😬"];
const DRAW_MESSAGES = ["Too close 🤝", "Great minds... 🧠", "Mirror match 🪞"];

function getRandomMessage(messages: string[]) {
  return messages[Math.floor(Math.random() * messages.length)];
}

export function RoundResultScreen() {
  const {
    game,
    playerIndex,
    lastRoundResult,
    handleNextRound,
    isNextRoundPending,
  } = useGame();

  const message = useMemo(() => {
    if (!lastRoundResult) return "";
    const isDraw = lastRoundResult.winner === "draw";
    const playerWon =
      (playerIndex === 0 && lastRoundResult.winner === "player1") ||
      (playerIndex === 1 && lastRoundResult.winner === "player2");

    if (isDraw) return getRandomMessage(DRAW_MESSAGES);
    if (playerWon) return getRandomMessage(WIN_MESSAGES);
    return getRandomMessage(LOSE_MESSAGES);
  }, [lastRoundResult, playerIndex]);

  if (!game || !lastRoundResult) return null;

  const playerWon =
    (playerIndex === 0 && lastRoundResult.winner === "player1") ||
    (playerIndex === 1 && lastRoundResult.winner === "player2");
  const isDraw = lastRoundResult.winner === "draw";
  const isLastRound = game.currentRound >= game.rounds;

  return (
    <section
      data-testid="round-result-screen"
      className="flex flex-col items-center gap-8 text-center w-full max-w-lg"
    >
      <header className="flex flex-col gap-2">
        <p className="font-fun text-lg text-gray-400">
          Round {lastRoundResult.round} Result
        </p>

        <motion.h2
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
          className={clsx(
            "font-fun text-4xl md:text-5xl",
            isDraw && "text-rps-yellow",
            !isDraw && playerWon && "text-green-500",
            !isDraw && !playerWon && "text-rps-red",
          )}
        >
          {message}
        </motion.h2>
      </header>

      <div className="flex justify-center items-center gap-8">
        <motion.figure
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={clsx("flex flex-col items-center gap-2 p-4 rounded-2xl")}
        >
          <figcaption className="font-fun text-lg text-gray-500">
            {game.players[0]?.name}
          </figcaption>
          <motion.span
            animate={
              isDraw
                ? { scale: [1, 1.1, 1] }
                : !playerWon && playerIndex === 1
                  ? { scale: [1, 1.2, 1] }
                  : playerWon && playerIndex === 0
                    ? { scale: [1, 1.2, 1] }
                    : { x: [-3, 3, -3, 0] }
            }
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-6xl md:text-7xl"
          >
            {moveEmojiMap[lastRoundResult.moves[0]]}
          </motion.span>
        </motion.figure>

        <span className="font-fun text-3xl text-gray-300">VS</span>

        <motion.figure
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className={clsx("flex flex-col items-center gap-2 p-4 rounded-2xl")}
        >
          <figcaption className="font-fun text-lg text-gray-500">
            {game.players[1]?.name}
          </figcaption>
          <motion.span
            animate={
              isDraw
                ? { scale: [1, 1.1, 1] }
                : !playerWon && playerIndex === 0
                  ? { scale: [1, 1.2, 1] }
                  : playerWon && playerIndex === 1
                    ? { scale: [1, 1.2, 1] }
                    : { x: [-3, 3, -3, 0] }
            }
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-6xl md:text-7xl"
          >
            {moveEmojiMap[lastRoundResult.moves[1]]}
          </motion.span>
        </motion.figure>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-8 font-fun text-2xl text-gray-600"
      >
        <span>
          {game.players[0]?.name}: {game.players[0]?.score}
        </span>
        <span className="text-gray-300">-</span>
        <span>
          {game.players[1]?.name}: {game.players[1]?.score}
        </span>
      </motion.div>

      {!isLastRound && (
        <Button asChild variant="blue">
          <motion.button
            type="button"
            data-testid="next-round-button"
            onClick={handleNextRound}
            disabled={isNextRoundPending}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isNextRoundPending ? "..." : "Next Round →"}
          </motion.button>
        </Button>
      )}
    </section>
  );
}
