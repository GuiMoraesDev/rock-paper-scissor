"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/atoms/Button";
import { clearPlayerToken } from "@/lib/game-api";
import { moveEmojiMap } from "@/lib/gameplay";
import { useGameSSE } from "../../../../_src/providers/GameSSEProvider";
import { AnswerRematchButton } from "./_src/components/AnswerRematchButton";
import { RequestRematchButton } from "./_src/components/RequestRematchButton";

type ResultsViewProps = {
  gameId: string;
};

export const ResultsView = ({ gameId }: ResultsViewProps) => {
  const router = useRouter();
  const { game, playerIndex, rematchState, rematchRequesterName } =
    useGameSSE();

  const handlePlayAgain = useCallback(() => {
    clearPlayerToken();
    router.push("/");
  }, [router]);

  if (!game) return null;

  const isDraw = game.winner === "draw";
  const playerWon =
    (playerIndex === 0 && game.winner === "player1") ||
    (playerIndex === 1 && game.winner === "player2");

  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <section
        data-testid="game-finished-screen"
        className="flex flex-col items-center gap-6 text-center w-full max-w-lg"
      >
        <header className="flex flex-col gap-2">
          <motion.h2
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-fun text-3xl md:text-4xl text-gray-400"
          >
            Game Over!
          </motion.h2>

          <motion.p
            data-testid="game-result"
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
              isDraw && "text-rps-yellow",
              !isDraw && game.winner === "player1" && "text-green-500",
              !isDraw && game.winner === "player2" && "text-rps-red",
            )}
          >
            {game.players[0]?.name}: {game.players[0]?.score ?? 0}
          </span>
          <span className="text-gray-300">-</span>
          <span
            className={clsx(
              isDraw && "text-rps-yellow",
              !isDraw && game.winner === "player2" && "text-green-500",
              !isDraw && game.winner === "player1" && "text-rps-red",
            )}
          >
            {game.players[1]?.name}: {game.players[1]?.score ?? 0}
          </span>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3 w-full bg-gray-50 rounded-2xl p-6 border-3 border-gray-100 shadow-sm"
        >
          <h3
            data-testid="round-by-round"
            className="font-fun text-2xl text-gray-600"
          >
            Round by Round
          </h3>

          {game.roundResults.map((result, idx) => {
            const roundWinnerName =
              result.winner === "draw"
                ? "Draw"
                : result.winner === "player1"
                  ? game.players[0]?.name
                  : game.players[1]?.name;

            const isCurrentPlayerWinner =
              (result.winner === "player1" && playerIndex === 0) ||
              (result.winner === "player2" && playerIndex === 1);

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
                      isCurrentPlayerWinner &&
                      "text-green-500",
                    result.winner !== "draw" &&
                      !isCurrentPlayerWinner &&
                      "text-rps-red",
                  )}
                >
                  {roundWinnerName}
                </span>
              </motion.article>
            );
          })}
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          {rematchState === "idle" && <RequestRematchButton gameId={gameId} />}

          {rematchState === "requested" && (
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-fun text-2xl text-rps-blue"
            >
              Waiting for opponent to accept...
            </motion.p>
          )}

          {rematchState === "received" && (
            <section className="flex flex-col items-center gap-3">
              <p className="font-fun text-xl text-gray-600">
                {rematchRequesterName} wants a rematch!
              </p>

              <AnswerRematchButton gameId={gameId} />
            </section>
          )}

          <Button
            data-testid="back-home-button"
            variant="ghost"
            size="sm"
            onClick={handlePlayAgain}
          >
            ← Back to Home
          </Button>
        </motion.div>
      </section>
    </motion.div>
  );
};
