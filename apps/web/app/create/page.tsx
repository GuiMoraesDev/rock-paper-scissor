"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState<"name" | "rounds">("name");
  const [playerName, setPlayerName] = useState("");

  useEffect(() => {
    const socket = getSocket();

    socket.on("game-created", ({ gameId }) => {
      router.push(`/game/${gameId}`);
    });

    return () => {
      socket.off("game-created");
    };
  }, [router]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (playerName.trim()) {
      setStep("rounds");
    }
  };

  const handleRoundsSelect = (rounds: number) => {
    const socket = getSocket();
    socket.emit("create-game", { playerName: playerName.trim(), rounds });
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <div className="text-center animate-bounce-in w-full max-w-lg">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" className="absolute top-6 left-6 hover:text-rps-blue">
            ← Back
          </Link>
        </Button>

        {step === "name" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl text-rps-blue mb-8">
              What&apos;s your name?
            </h2>
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-6">
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                focusColor="blue"
              />
              <Button type="submit" disabled={!playerName.trim()}>
                Next →
              </Button>
            </form>
          </div>
        )}

        {step === "rounds" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl text-rps-blue mb-4">
              How many rounds?
            </h2>
            <p className="font-fun text-xl text-gray-400 mb-8">
              Choose wisely, {playerName}!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {[1, 3, 5].map((rounds) => (
                <Button
                  key={rounds}
                  variant={rounds === 1 ? "yellow" : rounds === 3 ? "red" : "blue"}
                  onClick={() => handleRoundsSelect(rounds)}
                  className="flex-1"
                >
                  <span className="text-5xl md:text-6xl block mb-2">
                    {rounds === 1 ? "⚡" : rounds === 3 ? "🔥" : "💀"}
                  </span>
                  {rounds} {rounds === 1 ? "Round" : "Rounds"}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
