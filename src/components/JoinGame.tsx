"use client";

import { useState } from "react";

interface Props {
  onBack: () => void;
  onJoin: (gameId: string, playerName: string) => void;
}

export default function JoinGame({ onBack, onJoin }: Props) {
  const [step, setStep] = useState<"name" | "code">("name");
  const [playerName, setPlayerName] = useState("");
  const [gameId, setGameId] = useState("");

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      setStep("code");
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameId.trim()) {
      onJoin(gameId.trim(), playerName.trim());
    }
  };

  return (
    <div className="text-center animate-bounce-in w-full max-w-lg">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 font-fun text-xl text-white/60 hover:text-white transition-colors"
      >
        ← Back
      </button>

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
              className="font-fun text-2xl md:text-3xl text-center bg-white/10 backdrop-blur-sm
                border-2 border-white/30 rounded-2xl px-6 py-4 text-white placeholder-white/40
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
              className="font-fun text-4xl md:text-5xl text-center tracking-[0.5em] bg-white/10
                backdrop-blur-sm border-2 border-white/30 rounded-2xl px-6 py-4 text-white
                placeholder-white/20 focus:outline-none focus:border-cyan-400 transition-colors uppercase"
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
  );
}
