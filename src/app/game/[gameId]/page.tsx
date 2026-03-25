"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { GameState, RoundResult, Move } from "@/lib/types";
import Lobby from "@/components/Lobby";
import GamePlay from "@/components/GamePlay";
import RoundResultScreen from "@/components/RoundResultScreen";
import GameFinished from "@/components/GameFinished";

export default function GamePage() {
  const params = useParams()!;
  const router = useRouter();
  const gameId = params.gameId as string;

  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(
    null
  );
  const [error, setError] = useState("");

  useEffect(() => {
    const socket = getSocket();

    // Determine player index from existing socket state
    socket.on("game-created", ({ game }) => {
      setGame(game);
      setPlayerIndex(0);
    });

    socket.on("joined-game", ({ game }) => {
      setGame(game);
      setPlayerIndex(1);
    });

    socket.on("game-updated", ({ game }) => {
      setGame(game);
    });

    socket.on("round-result", ({ game, roundResult }) => {
      setGame(game);
      setLastRoundResult(roundResult);
    });

    socket.on("game-finished", ({ game }) => {
      setGame(game);
    });

    socket.on("error-msg", ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    socket.on("player-disconnected", ({ playerName }) => {
      setError(`${playerName} disconnected!`);
    });

    // Request current game state in case of page refresh
    socket.emit("request-game-state", { gameId });

    socket.on("game-state-response", ({ game, playerIndex: pIdx }) => {
      if (game) {
        setGame(game);
        setPlayerIndex(pIdx);
      }
    });

    return () => {
      socket.off("game-created");
      socket.off("joined-game");
      socket.off("game-updated");
      socket.off("round-result");
      socket.off("game-finished");
      socket.off("error-msg");
      socket.off("player-disconnected");
      socket.off("game-state-response");
    };
  }, [gameId]);

  const handleReady = () => {
    getSocket().emit("player-ready");
  };

  const handleMove = (move: Move) => {
    getSocket().emit("make-move", { move });
  };

  const handleNextRound = () => {
    getSocket().emit("next-round");
  };

  const handlePlayAgain = () => {
    router.push("/");
  };

  const status = game?.status;

  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-fun text-xl z-50 animate-bounce-in">
          {error}
        </div>
      )}

      {!game && playerIndex === -1 && (
        <div className="text-center">
          <p className="font-fun text-2xl text-white/50 animate-pulse">
            Connecting to game {gameId}...
          </p>
        </div>
      )}

      {game && (status === "waiting" || status === "ready") && (
        <Lobby game={game} playerIndex={playerIndex} onReady={handleReady} />
      )}

      {game && status === "playing" && (
        <GamePlay game={game} playerIndex={playerIndex} onMove={handleMove} />
      )}

      {game && status === "round-result" && lastRoundResult && (
        <RoundResultScreen
          game={game}
          playerIndex={playerIndex}
          roundResult={lastRoundResult}
          onNextRound={handleNextRound}
          isLastRound={game.currentRound >= game.rounds}
        />
      )}

      {game && status === "finished" && (
        <GameFinished
          game={game}
          playerIndex={playerIndex}
          onPlayAgain={handlePlayAgain}
        />
      )}
    </main>
  );
}
