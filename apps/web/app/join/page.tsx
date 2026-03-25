"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";

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
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-rps-red text-white px-6 py-3 rounded-xl font-fun text-xl z-50 animate-bounce-in shadow-lg">
          {error}
        </div>
      )}

      <div className="text-center animate-bounce-in w-full max-w-lg">
        <Link
          href="/"
          className="absolute top-6 left-6 font-fun text-xl text-gray-400 hover:text-rps-red transition-colors"
        >
          ← Back
        </Link>

        {step === "name" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl mb-8 text-rps-red">
              What&apos;s your name?
            </h2>
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-6">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                maxLength={20}
                autoFocus
                className="font-fun text-2xl md:text-3xl text-center bg-white
                  border-3 border-gray-200 rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-300
                  focus:outline-none focus:border-rps-red transition-colors shadow-md"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="game-btn bg-rps-red hover:bg-rps-red-dark text-white
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next →
              </button>
            </form>
          </div>
        )}

        {step === "code" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl mb-4 text-rps-red">
              Enter Game Code
            </h2>
            <p className="font-fun text-xl text-gray-400 mb-8">
              Ask your friend for the code!
            </p>
            <form onSubmit={handleJoin} className="flex flex-col gap-6">
              <input
                type="text"
                value={gameId}
                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                autoFocus
                className="font-fun text-4xl md:text-5xl text-center tracking-[0.5em] bg-white
                  border-3 border-gray-200 rounded-2xl px-6 py-4 text-gray-800
                  placeholder-gray-300 focus:outline-none focus:border-rps-red transition-colors shadow-md uppercase"
              />
              <button
                type="submit"
                disabled={gameId.trim().length < 6}
                className="game-btn bg-rps-red hover:bg-rps-red-dark text-white
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Join Game
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
