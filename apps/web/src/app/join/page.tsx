"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Toast } from "@/components/atoms/Toast";

export default function JoinPage() {
  const router = useRouter();
  const [step, setStep] = useState<"name" | "code">("name");
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = getSocket();

    socket.on("joined-game", ({ gameId }) => {
      router.push(`/game/${gameId}`);
    });

    socket.on("error-msg", ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off("joined-game");
      socket.off("error-msg");
    };
  }, [router]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStep("code");
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      const socket = getSocket();
      socket.emit("join-game", {
        gameId: gameId.trim().toUpperCase(),
        playerName: playerName.trim(),
      });
    }
  };

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      <Toast message={error} />

      <div className="text-center animate-bounce-in w-full max-w-lg">
        <Button asChild variant="ghost" size="sm">
          <Link href="/" className="absolute top-6 left-6 hover:text-rps-red">
            ← Back
          </Link>
        </Button>

        {step === "name" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl text-rps-red mb-8">
              What&apos;s your name?
            </h2>
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-6">
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                focusColor="red"
              />
              <Button variant="red" type="submit" disabled={!playerName.trim()}>
                Next →
              </Button>
            </form>
          </div>
        )}

        {step === "code" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl text-rps-red mb-4">
              Enter Game Code
            </h2>
            <p className="font-fun text-xl text-gray-400 mb-8">
              Ask your friend for the code!
            </p>
            <form onSubmit={handleJoin} className="flex flex-col gap-6">
              <Input
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                autoFocus
                focusColor="red"
                size="lg"
              />
              <Button
                variant="red"
                type="submit"
                disabled={gameId.trim().length < 6}
              >
                Join Game
              </Button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
