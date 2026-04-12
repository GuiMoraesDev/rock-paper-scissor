"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "../../provider/GameProvider";
import { GamePlay } from "./_src/components/GamePlay";
import { RoundResultScreen } from "./_src/components/RoundResultScreen";

export function GameClient() {
  const { game } = useGame();

  const status = game?.status;

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
