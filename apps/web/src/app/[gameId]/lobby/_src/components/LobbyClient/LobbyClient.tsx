"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useLobby } from "../../provider/LobbyProvider";
import { Lobby } from "../Lobby";

export const LobbyClient = () => {
  const { game, playerIndex } = useLobby();

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
      <motion.div
        key="lobby"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Lobby />
      </motion.div>
    </AnimatePresence>
  );
};
