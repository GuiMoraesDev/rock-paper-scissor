"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Lobby } from "../Lobby";

export const LobbyClient = () => {
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
