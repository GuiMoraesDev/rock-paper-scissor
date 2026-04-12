"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/atoms/Button";

export const GameNotFound = () => (
  <motion.section
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center gap-6 text-center"
  >
    <p data-testid="game-not-found" className="font-fun text-4xl text-white">
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
