"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { toast } from "@/components/atoms/Toaster";
import { useGame } from "../../provider/GameProvider";
import { GamePlay } from "./_src/components/GamePlay";
import { RoundResultScreen } from "./_src/components/RoundResultScreen";

export function GameClient() {
  const { game, playerIndex, error } = useGame();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const status = game?.status;

  if (error) {
    return (
      <section className="flex flex-col items-center gap-6 text-center">
        <p className="font-fun text-2xl text-gray-400 animate-pulse">
          Error while connecting to game...
        </p>
        <Button asChild>
          <Link href="/">Back to Home</Link>
        </Button>
      </section>
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

      {status === "round-result" && (
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
    </AnimatePresence>
  );
}
