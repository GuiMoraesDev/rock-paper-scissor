"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { useGame } from "../../../../../provider/GameProvider";
import { moveEmojiMap } from "../../constants/gameplay";

export function GameFinished() {
  const { game, playerIndex, handlePlayAgain } = useGame();

  if (!game) return null;

  const p1Score = game.players[0]?.score || 0;
  const p2Score = game.players[1]?.score || 0;
  const isDraw = p1Score === p2Score;
  const winnerIndex = p1Score > p2Score ? 0 : 1;
  const playerWon = winnerIndex === playerIndex;

  return (
    <section className="flex flex-col items-center gap-6 text-center w-full max-w-lg">
      <header className="flex flex-col gap-2">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-fun text-3xl md:text-4xl text-gray-400"
        >
          Game Over!
        </motion.h2>

        <motion.p
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          className={clsx(
            "font-fun text-5xl md:text-6xl",
            isDraw && "text-rps-yellow",
            !isDraw && playerWon && "text-green-500",
            !isDraw && !playerWon && "text-rps-red",
          )}
        >
          {isDraw
            ? "🤝 It's a Tie! 🤝"
            : playerWon
              ? "🏆 You Win! 🏆"
              : "😢 You Lose! 😢"}
        </motion.p>
      </header>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center gap-8 font-fun text-3xl"
      >
        <span
          className={clsx(
            p1Score > p2Score && "text-green-500",
            p1Score < p2Score && "text-rps-red",
            p1Score === p2Score && "text-rps-yellow",
          )}
        >
          {game.players[0]?.name}: {p1Score}
        </span>
        <span className="text-gray-300">-</span>
        <span
          className={clsx(
            p2Score > p1Score && "text-green-500",
            p2Score < p1Score && "text-rps-red",
            p2Score === p1Score && "text-rps-yellow",
          )}
        >
          {game.players[1]?.name}: {p2Score}
        </span>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full bg-gray-50 rounded-2xl p-6 border-3 border-gray-100 shadow-sm"
      >
        <h3 className="font-fun text-2xl text-gray-600">Round by Round</h3>

        {game.roundResults.map((result, idx) => {
          const roundWinnerName =
            result.winner === "draw"
              ? "Draw"
              : result.winner === "player1"
                ? game.players[0]?.name
                : game.players[1]?.name;

          return (
            <motion.article
              key={result.round}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + idx * 0.1 }}
              className="flex items-center justify-between bg-white rounded-xl px-4 py-3 shadow-sm"
            >
              <span className="font-fun text-lg text-gray-400">
                Round {result.round}
              </span>

              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {moveEmojiMap[result.moves[0]]}
                </span>

                <span className="font-fun text-sm text-gray-300">vs</span>

                <span className="text-2xl">
                  {moveEmojiMap[result.moves[1]]}
                </span>
              </div>

              <span
                className={clsx(
                  "font-fun text-lg",
                  result.winner === "draw" && "text-rps-yellow",
                  result.winner !== "draw" &&
                    ((result.winner === "player1" && playerIndex === 0) ||
                      (result.winner === "player2" && playerIndex === 1))
                    ? "text-green-500"
                    : result.winner !== "draw" && "text-rps-red",
                )}
              >
                {roundWinnerName}
              </span>
            </motion.article>
          );
        })}
      </motion.section>

      <Button asChild variant="blue">
        <motion.button
          type="button"
          onClick={handlePlayAgain}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Play Again
        </motion.button>
      </Button>
    </section>
  );
}
