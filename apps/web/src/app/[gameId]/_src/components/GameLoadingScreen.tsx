"use client";

import { motion } from "framer-motion";

export const GameLoadingScreen = () => (
  <motion.p
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center font-fun text-2xl text-gray-400 animate-pulse"
  >
    Connecting to game...
  </motion.p>
);
