"use client";

import { motion } from "framer-motion";
import { GameFinished } from "./_src/components/GameFinished";

export const ResultsClient = () => {
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
