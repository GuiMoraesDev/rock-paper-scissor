"use client";

import { Button } from "@/components/atoms/Button";
import { Modal } from "@/components/atoms/Modal";
import type { AIDifficulty } from "@/lib/types";

const DIFFICULTY_OPTIONS: {
  value: AIDifficulty;
  label: string;
  description: string;
}[] = [
  { value: "easy", label: "Easy", description: "Random moves" },
  { value: "normal", label: "Normal", description: "Learns during the game" },
  { value: "hard", label: "Hard", description: "Remembers all your games" },
];

type AIDifficultyModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (difficulty: AIDifficulty) => void;
};

export const AIDifficultyModal = ({
  open,
  onClose,
  onSelect,
}: AIDifficultyModalProps) => (
  <Modal open={open} onClose={onClose}>
    <section className="flex flex-col items-center gap-6 min-w-[280px]">
      <h3 className="font-fun text-3xl text-gray-800">Choose Difficulty</h3>

      <div className="flex flex-col gap-3 w-full">
        {DIFFICULTY_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            data-testid={`ai-difficulty-${option.value}`}
            onClick={() => onSelect(option.value)}
            className="w-full"
          >
            <span className="flex flex-col items-center">
              <span>{option.label}</span>
              <span className="text-sm opacity-75">{option.description}</span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  </Modal>
);
