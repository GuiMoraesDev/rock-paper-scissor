"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import { Toast } from "@/components/atoms/Toast";
import { useGame } from "../../provider/GameProvider";
import { GameFinished } from "./_src/components/GameFinished";
import { GamePlay } from "./_src/components/GamePlay";
import { Lobby } from "./_src/components/Lobby";
import { RoundResultScreen } from "./_src/components/RoundResultScreen";

export function GameClient() {
  const { game, playerIndex, lastRoundResult, error, gameNotFound } = useGame();

  const status = game?.status;

  if (gameNotFound) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-6 text-center"
      >
        <p
          data-testid="game-not-found"
          className="font-fun text-4xl text-white"
        >
          Game not found
        </p>
        <p className="font-fun text-xl text-gray-400">
          This game doesn&apos;t exist or has already ended.
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </motion.section>
    );
  }

  if (error) {
    return (
      <>
        <Toast message={error} />

        <p className="text-center font-fun text-2xl text-gray-400 animate-pulse">
          Error while connecting to game...
        </p>
      </>
    );
  }

  const isLoading = !game && playerIndex === -1;

  if (isLoading) {
    return (
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center font-fun text-2xl text-gray-400 animate-pulse"
      >
        Connecting to game...
      </motion.p>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {(status === "waiting" || status === "ready") && (
        <motion.div
          key="lobby"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Lobby />
        </motion.div>
      )}

      {status === "playing" && (
        <motion.div
          key="playing"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <GamePlay />
        </motion.div>
      )}

      {status === "round-result" && lastRoundResult && (
        <motion.div
          key="round-result"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.4 }}
        >
          <RoundResultScreen />
        </motion.div>
      )}

      {status === "finished" && (
        <motion.div
          key="finished"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
        >
          <GameFinished />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
