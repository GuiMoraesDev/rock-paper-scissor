"use client";

import type { GameState, Move, RoundResult } from "@rps/shared";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Toast } from "@/components/atoms/Toast";
import GameFinished from "@/components/GameFinished";
import GamePlay from "@/components/GamePlay";
import Lobby from "@/components/Lobby";
import RoundResultScreen from "@/components/RoundResultScreen";
import { getSocket } from "@/lib/socket";

type GameClientProps = {
  gameId: string;
};

export function GameClient({ gameId }: GameClientProps) {
  const router = useRouter();

  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(
    null,
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
    <>
      <Toast message={error} />

      {!game && playerIndex === -1 && (
        <div className="text-center">
          <p className="font-fun text-2xl text-gray-400 animate-pulse">
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
    </>
  );
}
