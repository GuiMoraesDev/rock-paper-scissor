"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/Button";
import { getAIMoveHistory } from "@/lib/game-api";
import type { AIDifficulty } from "@/lib/types";
import { useAddAIPlayerMutation } from "../../../../../hooks/useAddAIPlayerMutation";
import { AIDifficultyModal } from "./_src/components/AIDifficultyModal";

type AddAIButtonProps = {
  gameId: string;
};

export const AddAIButton = ({ gameId }: AddAIButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { mutate, isPending } = useAddAIPlayerMutation({
    onSuccess: () => setIsModalOpen(false),
  });

  const handleAddAI = (difficulty: AIDifficulty) => {
    const moveHistory = difficulty === "hard" ? getAIMoveHistory() : [];
    mutate({ gameId, difficulty, moveHistory });
  };

  return (
    <>
      <Button
        size="icon"
        variant="ghost"
        data-testid="add-ai-button"
        disabled={isPending}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-[calc(100%+0.5rem)]"
        onClick={() => setIsModalOpen(true)}
      >
        {isPending ? "⏳" : "🤖"}
      </Button>

      <AIDifficultyModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleAddAI}
      />
    </>
  );
};
