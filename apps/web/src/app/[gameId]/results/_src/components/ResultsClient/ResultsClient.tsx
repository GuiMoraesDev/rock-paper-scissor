"use client";

import { motion } from "framer-motion";
import { useResults } from "../../provider/ResultsProvider";
import { GameFinished } from "./_src/components/GameFinished";

export const ResultsClient = () => {
  const { game, playerIndex } = useResults();

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
