"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { useMarkPlayerReadyMutation } from "../../../../../hooks/useMarkPlayerReadyMutation";

type ReadyButtonProps = {
  gameId: string;
  disabled: boolean;
};

export const ReadyButton = ({ gameId, disabled }: ReadyButtonProps) => {
  const { mutate, isPending } = useMarkPlayerReadyMutation();

  return (
    <Button asChild variant="green">
      <motion.button
        type="button"
        data-testid="ready-button"
        onClick={() => mutate({ gameId })}
        disabled={disabled || isPending}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPending ? "..." : "✊ I'm Ready!"}
      </motion.button>
    </Button>
  );
};
