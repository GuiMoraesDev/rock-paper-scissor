"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { Button } from "@/components/atoms/Button";
import { useGame } from "../../../../../provider/GameProvider";

export function Lobby() {
  const { game, playerIndex, handleReady, handleLeaveGame, handleKickPlayer } =
    useGame();

  if (!game) return null;

  const isReady = game.players[playerIndex]?.ready;

  return (
    <section className="flex flex-col items-center gap-8 text-center w-full max-w-lg">
      <header className="flex flex-col gap-2">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-fun text-4xl md:text-5xl text-rps-blue"
        >
          Game Lobby
        </motion.h2>

        <p className="font-fun text-lg text-gray-400">Game Code</p>

        <motion.button
          type="button"
          data-testid="game-code"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            "font-fun text-4xl md:text-5xl tracking-[0.4em] text-gray-800",
            "bg-gray-50 rounded-2xl py-4 px-6 border-3 border-gray-200",
            "cursor-pointer hover:border-rps-blue transition-colors shadow-md",
          )}
          onClick={() => navigator.clipboard.writeText(game.id)}
          title="Click to copy"
        >
          {game.id}
        </motion.button>

        <p className="font-fun text-sm text-gray-400">
          Click code to copy • Share with your friend!
        </p>

        <motion.button
          type="button"
          data-testid="copy-link-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={clsx(
            "font-fun text-lg text-rps-blue",
            "bg-blue-50 rounded-xl py-2 px-4 border-2 border-blue-200",
            "cursor-pointer hover:border-rps-blue transition-colors",
          )}
          onClick={() =>
            navigator.clipboard.writeText(
              `${window.location.origin}/game/${game.id}`,
            )
          }
        >
          🔗 Copy Game Link
        </motion.button>
      </header>

      <p className="font-fun text-xl text-gray-500">
        Best of {game.rounds} round{game.rounds > 1 ? "s" : ""}
      </p>

      <section className="flex flex-col gap-4 w-full">
        <p className="font-fun text-2xl text-gray-600">Players</p>

        {game.players.map((player, idx) => (
          <motion.article
            key={player.name}
            data-testid={`player-${idx}`}
            initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.15 }}
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
            <div className="flex items-center gap-3">
              <span
                className={clsx(
                  "font-fun text-lg",
                  player.ready ? "text-green-500" : "text-gray-400",
                )}
              >
                {player.ready ? "✅ Ready!" : "⏳ Waiting..."}
              </span>

              {playerIndex === 0 && idx === 1 && (
                <Button
                  variant="red"
                  size="icon"
                  data-testid="kick-player-button"
                  onClick={handleKickPlayer}
                  title="Kick player"
                >
                  ✕
                </Button>
              )}
            </div>
          </motion.article>
        ))}

        {game.players.length < 2 && (
          <motion.p
            data-testid="waiting-opponent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={clsx(
              "flex items-center justify-center font-fun text-xl text-gray-300",
              "bg-gray-50 rounded-xl px-6 py-4 border-3 border-dashed border-gray-200",
            )}
          >
            Waiting for opponent...
          </motion.p>
        )}
      </section>

      {isReady ? (
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="font-fun text-2xl text-green-500"
        >
          Waiting for opponent to be ready...
        </motion.p>
      ) : (
        <Button asChild variant="green">
          <motion.button
            type="button"
            data-testid="ready-button"
            onClick={handleReady}
            disabled={game.players.length < 2}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ✊ I&apos;m Ready!
          </motion.button>
        </Button>
      )}

      <Button
        variant="ghost"
        size="sm"
        data-testid="leave-game-button"
        onClick={handleLeaveGame}
      >
        ← {playerIndex === 0 ? "Destroy & Leave" : "Leave Game"}
      </Button>
    </section>
  );
}
