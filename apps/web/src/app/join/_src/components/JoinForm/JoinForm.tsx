"use client";

import { SocketEvents } from "@rps/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Toast } from "@/components/atoms/Toast";
import { getSocket } from "@/lib/socket";

export function JoinForm() {
  const router = useRouter();
  const [step, setStep] = useState<"name" | "code">("name");
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = getSocket();

    socket.on(SocketEvents.JOINED_GAME, ({ gameId }) => {
      router.push(`/game/${gameId}`);
    });

    socket.on(SocketEvents.ERROR_MSG, ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    return () => {
      socket.off(SocketEvents.JOINED_GAME);
      socket.off(SocketEvents.ERROR_MSG);
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
      socket.emit(SocketEvents.JOIN_GAME, {
        gameId: gameId.trim().toUpperCase(),
        playerName: playerName.trim(),
      });
    }
  };

  return (
    <>
      <Toast message={error} />

      <section className="text-center animate-bounce-in w-full max-w-lg flex flex-col gap-8">
        {step === "name" && (
          <>
            <h2 className="font-fun text-4xl md:text-5xl text-rps-red">
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
                focusColor="red"
              />

              <Button
                data-testid="next-button"
                variant="red"
                type="submit"
                disabled={!playerName.trim()}
              >
                Next →
              </Button>
            </form>
          </>
        )}

        {step === "code" && (
          <>
            <header className="flex flex-col gap-4">
              <h2 className="font-fun text-4xl md:text-5xl text-rps-red">
                Enter Game Code
              </h2>

              <p className="font-fun text-xl text-gray-400">
                Ask your friend for the code!
              </p>
            </header>

            <form onSubmit={handleJoin} className="flex flex-col gap-6">
              <Input
                data-testid="game-code-input"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                autoFocus
                focusColor="red"
                size="lg"
              />
              <Button
                data-testid="join-game-button"
                variant="red"
                type="submit"
                disabled={gameId.trim().length < 6}
              >
                Join Game
              </Button>
            </form>
          </>
        )}
      </section>
    </>
  );
}
