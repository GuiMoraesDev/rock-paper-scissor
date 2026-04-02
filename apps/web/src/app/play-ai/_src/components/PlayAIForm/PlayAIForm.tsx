"use client";

import { type AIDifficulty, SocketEvents } from "@rps/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { getSocket } from "@/lib/socket";

const ROUNDS_OPTIONS = [1, 3, 5];

const DIFFICULTY_OPTIONS: {
  value: AIDifficulty;
  label: string;
  emoji: string;
  color: "green" | "yellow" | "red";
}[] = [
  { value: "easy", label: "Easy", emoji: "🟢", color: "green" },
  { value: "normal", label: "Normal", emoji: "🟡", color: "yellow" },
  { value: "hard", label: "Hard", emoji: "🔴", color: "red" },
];

export function PlayAIForm() {
  const router = useRouter();
  const [step, setStep] = useState<"name" | "difficulty" | "rounds">("name");
  const [playerName, setPlayerName] = useState("");
  const [difficulty, setDifficulty] = useState<AIDifficulty>("normal");

  useEffect(() => {
    const socket = getSocket();

    socket.on(SocketEvents.GAME_CREATED, ({ gameId }) => {
      router.push(`/game/${gameId}`);
    });

    return () => {
      socket.off(SocketEvents.GAME_CREATED);
    };
  }, [router]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStep("difficulty");
    }
  };

  const handleDifficultySelect = (selected: AIDifficulty) => {
    setDifficulty(selected);
    setStep("rounds");
  };

  const handleRoundsSelect = (rounds: number) => {
    const socket = getSocket();
    socket.emit(SocketEvents.CREATE_AI_GAME, {
      playerName: playerName.trim(),
      rounds,
      difficulty,
    });
  };

  return (
    <section className="text-center animate-bounce-in w-full max-w-lg flex flex-col gap-8">
      {step === "name" && (
        <>
          <h2 className="font-fun text-4xl md:text-5xl text-rps-yellow">
            What&apos;s your name?
          </h2>

          <form onSubmit={handleNameSubmit} className="flex flex-col gap-6">
            <Input
              data-testid="name-input"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={20}
              autoFocus
              focusColor="yellow"
            />

            <Button
              data-testid="next-button"
              variant="yellow"
              type="submit"
              disabled={!playerName.trim()}
            >
              Next →
            </Button>
          </form>
        </>
      )}

      {step === "difficulty" && (
        <>
          <header className="flex flex-col gap-4">
            <h2 className="font-fun text-4xl md:text-5xl text-rps-yellow">
              Choose Difficulty
            </h2>

            <p className="font-fun text-xl text-gray-400">
              How tough should the AI be, {playerName}?
            </p>
          </header>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {DIFFICULTY_OPTIONS.map((option) => (
              <Button
                key={option.value}
                data-testid={`difficulty-${option.value}`}
                variant={option.color}
                onClick={() => handleDifficultySelect(option.value)}
                className="flex-1"
              >
                <span className="text-5xl md:text-6xl block">
                  {option.emoji}
                </span>
                {option.label}
              </Button>
            ))}
          </div>
        </>
      )}

      {step === "rounds" && (
        <>
          <header className="flex flex-col gap-4">
            <h2 className="font-fun text-4xl md:text-5xl text-rps-yellow">
              How many rounds?
            </h2>

            <p className="font-fun text-xl text-gray-400">
              Choose wisely, {playerName}!
            </p>
          </header>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {ROUNDS_OPTIONS.map((rounds) => (
              <Button
                key={rounds}
                data-testid={`rounds-${rounds}`}
                variant={
                  rounds === 1 ? "yellow" : rounds === 3 ? "red" : "blue"
                }
                onClick={() => handleRoundsSelect(rounds)}
                className="flex-1"
              >
                <span className="text-5xl md:text-6xl block">
                  {rounds === 1 ? "⚡" : rounds === 3 ? "🔥" : "💀"}
                </span>
                {rounds} {rounds === 1 ? "Round" : "Rounds"}
              </Button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
