"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSocket } from "@/lib/socket";

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
        <Link
          href="/"
          className="absolute top-6 left-6 font-fun text-xl text-white/60 hover:text-white transition-colors"
        >
          ← Back
        </Link>

        {step === "name" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl mb-8 text-yellow-400">
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
                  focus:outline-none focus:border-purple-400 transition-colors"
              />
              <button
                type="submit"
                disabled={!playerName.trim()}
                className="game-btn bg-gradient-to-r from-green-500 to-emerald-600 text-white
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Next →
              </button>
            </form>
          </div>
        )}

        {step === "rounds" && (
          <div>
            <h2 className="font-fun text-4xl md:text-5xl mb-4 text-yellow-400">
              How many rounds?
            </h2>
            <p className="font-fun text-xl text-white/50 mb-8">
              Choose wisely, {playerName}!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {[1, 3, 5].map((rounds) => (
                <button
                  key={rounds}
                  onClick={() => handleRoundsSelect(rounds)}
                  className="game-btn bg-gradient-to-br from-purple-600 to-indigo-700 text-white
                    flex-1 hover:from-purple-500 hover:to-indigo-600"
                >
                  <span className="text-5xl md:text-6xl block mb-2">
                    {rounds === 1 ? "⚡" : rounds === 3 ? "🔥" : "💀"}
                  </span>
                  {rounds} {rounds === 1 ? "Round" : "Rounds"}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
