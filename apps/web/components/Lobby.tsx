"use client";

import { GameState } from "@rps/shared";

interface Props {
  game: GameState;
  playerIndex: number;
  onReady: () => void;
}

export default function Lobby({ game, playerIndex, onReady }: Props) {
  const isReady = game.players[playerIndex]?.ready;

  return (
    <div className="text-center animate-bounce-in w-full max-w-lg">
      <h2 className="font-fun text-4xl md:text-5xl mb-2 text-yellow-400">
        Game Lobby
      </h2>

      <div className="mb-8">
        <p className="font-fun text-lg text-gray-800/50 mb-2">Game Code</p>
        <div
          className="font-fun text-4xl md:text-5xl tracking-[0.4em] text-gray-800 bg-white/10
          backdrop-blur-sm rounded-2xl py-4 px-6 inline-block border-2 border-white/20 cursor-pointer
          hover:border-purple-400 transition-colors"
          onClick={() => navigator.clipboard.writeText(game.id)}
          title="Click to copy"
        >
          {game.id}
        </div>
        <p className="font-fun text-sm text-gray-800/40 mt-2">
          Click to copy • Share with your friend!
        </p>
      </div>

      <div className="mb-8">
        <p className="font-fun text-xl text-gray-800/60 mb-2">
          Best of {game.rounds} round{game.rounds > 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="font-fun text-2xl text-gray-800/70">Players</p>
        {game.players.map((player, idx) => (
          <div
            key={idx}
            className={`flex items-center justify-between bg-white/10 backdrop-blur-sm
              rounded-xl px-6 py-4 border-2 transition-colors ${
                player.ready ? "border-green-400/60" : "border-white/20"
              }`}
          >
            <span className="font-fun text-xl md:text-2xl text-gray-800">
              {idx === playerIndex ? "👉 " : ""}
              {player.name}
            </span>
            <span
              className={`font-fun text-lg ${
                player.ready ? "text-green-400" : "text-gray-800/40"
              }`}
            >
              {player.ready ? "✅ Ready!" : "⏳ Waiting..."}
            </span>
          </div>
        ))}

        {game.players.length < 2 && (
          <div
            className="flex items-center justify-center bg-white/5 backdrop-blur-sm
            rounded-xl px-6 py-4 border-2 border-dashed border-white/20"
          >
            <span className="font-fun text-xl text-gray-800/30">
              Waiting for opponent...
            </span>
          </div>
        )}
      </div>

      {!isReady && (
        <button
          onClick={onReady}
          disabled={game.players.length < 2}
          className="game-btn bg-gradient-to-r from-green-500 to-emerald-600 text-gray-800
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
            animate-pulse-glow"
        >
          ✊ I&apos;m Ready!
        </button>
      )}

      {isReady && (
        <p className="font-fun text-2xl text-green-400 animate-pulse">
          Waiting for opponent to be ready...
        </p>
      )}
    </div>
  );
}
