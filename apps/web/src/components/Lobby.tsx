"use client";

import type { GameState } from "@rps/shared";

interface Props {
  game: GameState;
  playerIndex: number;
  onReady: () => void;
}

export default function Lobby({ game, playerIndex, onReady }: Props) {
  const isReady = game.players[playerIndex]?.ready;

  return (
    <div className="text-center animate-bounce-in w-full max-w-lg">
      <h2 className="font-fun text-4xl md:text-5xl mb-2 text-rps-blue">
        Game Lobby
      </h2>

      <div className="mb-8">
        <p className="font-fun text-lg text-gray-400 mb-2">Game Code</p>
        <button
          type="button"
          className="font-fun text-4xl md:text-5xl tracking-[0.4em] text-gray-800 bg-gray-50
          rounded-2xl py-4 px-6 inline-block border-3 border-gray-200 cursor-pointer
          hover:border-rps-blue transition-colors shadow-md"
          onClick={() => navigator.clipboard.writeText(game.id)}
          title="Click to copy"
        >
          {game.id}
        </button>
        <p className="font-fun text-sm text-gray-400 mt-2">
          Click to copy • Share with your friend!
        </p>
      </div>

      <div className="mb-8">
        <p className="font-fun text-xl text-gray-500">
          Best of {game.rounds} round{game.rounds > 1 ? "s" : ""}
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <p className="font-fun text-2xl text-gray-600">Players</p>
        {game.players.map((player, idx) => (
          <div
            key={player.name}
            className={`flex items-center justify-between bg-white
              rounded-xl px-6 py-4 border-3 transition-colors shadow-sm ${
                player.ready ? "border-green-400" : "border-gray-200"
              }`}
          >
            <span className="font-fun text-xl md:text-2xl text-gray-800">
              {idx === playerIndex ? "👉 " : ""}
              {player.name}
            </span>
            <span
              className={`font-fun text-lg ${
                player.ready ? "text-green-500" : "text-gray-400"
              }`}
            >
              {player.ready ? "✅ Ready!" : "⏳ Waiting..."}
            </span>
          </div>
        ))}

        {game.players.length < 2 && (
          <div
            className="flex items-center justify-center bg-gray-50
            rounded-xl px-6 py-4 border-3 border-dashed border-gray-200"
          >
            <span className="font-fun text-xl text-gray-300">
              Waiting for opponent...
            </span>
          </div>
        )}
      </div>

      {!isReady && (
        <button
          type="button"
          onClick={onReady}
          disabled={game.players.length < 2}
          className="game-btn bg-green-500 hover:bg-green-600 text-white
            disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
            animate-pulse-glow"
        >
          ✊ I&apos;m Ready!
        </button>
      )}

      {isReady && (
        <p className="font-fun text-2xl text-green-500 animate-pulse">
          Waiting for opponent to be ready...
        </p>
      )}
    </div>
  );
}
