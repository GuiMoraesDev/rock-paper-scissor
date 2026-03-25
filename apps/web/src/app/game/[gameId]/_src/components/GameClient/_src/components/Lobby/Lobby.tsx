"use client";

import clsx from "clsx";
import { useGame } from "../../../../../provider/GameProvider";

export function Lobby() {
  const { game, playerIndex, handleReady } = useGame();

  if (!game) return null;

  const isReady = game.players[playerIndex]?.ready;

  return (
    <section className="flex flex-col items-center gap-8 text-center animate-bounce-in w-full max-w-lg">
      <header className="flex flex-col gap-2">
        <h2 className="font-fun text-4xl md:text-5xl text-rps-blue">
          Game Lobby
        </h2>

        <p className="font-fun text-lg text-gray-400">Game Code</p>

        <button
          type="button"
          className={clsx(
            "font-fun text-4xl md:text-5xl tracking-[0.4em] text-gray-800",
            "bg-gray-50 rounded-2xl py-4 px-6 border-3 border-gray-200",
            "cursor-pointer hover:border-rps-blue transition-colors shadow-md",
          )}
          onClick={() => navigator.clipboard.writeText(game.id)}
          title="Click to copy"
        >
          {game.id}
        </button>

        <p className="font-fun text-sm text-gray-400">
          Click to copy • Share with your friend!
        </p>
      </header>

      <p className="font-fun text-xl text-gray-500">
        Best of {game.rounds} round{game.rounds > 1 ? "s" : ""}
      </p>

      <section className="flex flex-col gap-4 w-full">
        <p className="font-fun text-2xl text-gray-600">Players</p>

        {game.players.map((player, idx) => (
          <article
            key={player.name}
            className={clsx(
              "flex items-center justify-between rounded-xl px-6 py-4",
              "bg-white border-3 transition-colors shadow-sm",
              player.ready ? "border-green-400" : "border-gray-200",
            )}
          >
            <span className="font-fun text-xl md:text-2xl text-gray-800">
              {idx === playerIndex ? "👉 " : ""}
              {player.name}
            </span>
            <span
              className={clsx(
                "font-fun text-lg",
                player.ready ? "text-green-500" : "text-gray-400",
              )}
            >
              {player.ready ? "✅ Ready!" : "⏳ Waiting..."}
            </span>
          </article>
        ))}

        {game.players.length < 2 && (
          <p
            className={clsx(
              "flex items-center justify-center font-fun text-xl text-gray-300",
              "bg-gray-50 rounded-xl px-6 py-4 border-3 border-dashed border-gray-200",
            )}
          >
            Waiting for opponent...
          </p>
        )}
      </section>

      {isReady ? (
        <p className="font-fun text-2xl text-green-500 animate-pulse">
          Waiting for opponent to be ready...
        </p>
      ) : (
        <button
          type="button"
          onClick={handleReady}
          disabled={game.players.length < 2}
          className={clsx(
            "game-btn bg-green-500 hover:bg-green-600 text-white animate-pulse-glow",
            "disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100",
          )}
        >
          ✊ I&apos;m Ready!
        </button>
      )}
    </section>
  );
}
