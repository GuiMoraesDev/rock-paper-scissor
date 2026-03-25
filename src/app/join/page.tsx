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
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-fun text-xl z-50 animate-bounce-in">
          {error}
        </div>
      )}

      <div className="text-center animate-bounce-in w-full max-w-lg">
        <Link
          href="/"
          className="absolute top-6 left-6 font-fun text-xl text-white/60 hover:text-white transition-colors"
        >
          ← Back
        </Link>

        {step === "name" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl mb-8 text-cyan-400">
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
                className="font-fun text-2xl md:text-3xl text-center bg-white backdrop-blur-sm
                  border-2 border-white/30 rounded-2xl px-6 py-4 text-gray-800 placeholder-gray-400
                  focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="game-btn bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next →
              </button>
            </form>
          </div>
        )}

        {step === "code" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl mb-4 text-cyan-400">
              Enter Game Code
            </h2>
            <p className="font-fun text-xl text-white/50 mb-8">
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
                  backdrop-blur-sm border-2 border-white/30 rounded-2xl px-6 py-4 text-gray-800
                  placeholder-gray-300 focus:outline-none focus:border-cyan-400 transition-colors uppercase"
              />
              <button
                type="submit"
                disabled={gameId.trim().length < 6}
                className="game-btn bg-gradient-to-r from-cyan-500 to-blue-600 text-white
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                🚀 Join Game
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
