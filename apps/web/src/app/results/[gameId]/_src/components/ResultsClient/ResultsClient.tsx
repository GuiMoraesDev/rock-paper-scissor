"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/atoms/Button";
import { toast } from "@/components/atoms/Toaster";
import { useResults } from "../../provider/ResultsProvider";
import { GameFinished } from "./_src/components/GameFinished";

export const ResultsClient = () => {
  const { game, playerIndex, error, gameNotFound } = useResults();

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

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
        Loading results...
      </motion.p>
    );
  }

  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, type: "spring" }}
    >
      <GameFinished />
    </motion.div>
  );
};
