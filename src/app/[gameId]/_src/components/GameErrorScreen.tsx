"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";
import type { GameError } from "../providers/GameSSEProvider";

type Props = {
  error: NonNullable<GameError>;
};

export const GameErrorScreen = ({ error }: Props) => {
  const heading =
    error.type === "player-disconnected"
      ? `${error.playerName} disconnected.`
      : "Connection lost.";

  const subtext =
    error.type === "player-disconnected"
      ? "To continue playing, create a new game."
      : "To continue playing, start a new game.";

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center gap-6 text-center"
    >
      <p className="font-fun text-4xl text-rps-red">{heading}</p>
      <p className="font-fun text-xl text-gray-400">{subtext}</p>
      <Button asChild>
        <Link href="/">Back to Home</Link>
      </Button>
    </motion.section>
  );
};
