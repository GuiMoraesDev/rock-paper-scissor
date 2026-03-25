"use client";

import {
  type GameState,
  type Move,
  type RoundResult,
  SocketEvents,
} from "@rps/shared";
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
    socket.on(SocketEvents.GAME_CREATED, ({ game }) => {
      setGame(game);
      setPlayerIndex(0);
    });

    socket.on(SocketEvents.JOINED_GAME, ({ game }) => {
      setGame(game);
      setPlayerIndex(1);
    });

    socket.on(SocketEvents.GAME_UPDATED, ({ game }) => {
      setGame(game);
    });

    socket.on(SocketEvents.ROUND_RESULT, ({ game, roundResult }) => {
      setGame(game);
      setLastRoundResult(roundResult);
    });

    socket.on(SocketEvents.GAME_FINISHED, ({ game }) => {
      setGame(game);
    });

    socket.on(SocketEvents.ERROR_MSG, ({ message }) => {
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    socket.on(SocketEvents.PLAYER_DISCONNECTED, ({ playerName }) => {
      setError(`${playerName} disconnected!`);
    });

    // Request current game state in case of page refresh
    socket.emit(SocketEvents.REQUEST_GAME_STATE, { gameId });

    socket.on(
      SocketEvents.GAME_STATE_RESPONSE,
      ({ game, playerIndex: pIdx }) => {
        if (game) {
          setGame(game);
          setPlayerIndex(pIdx);
        }
      },
    );

    return () => {
      socket.off(SocketEvents.GAME_CREATED);
      socket.off(SocketEvents.JOINED_GAME);
      socket.off(SocketEvents.GAME_UPDATED);
      socket.off(SocketEvents.ROUND_RESULT);
      socket.off(SocketEvents.GAME_FINISHED);
      socket.off(SocketEvents.ERROR_MSG);
      socket.off(SocketEvents.PLAYER_DISCONNECTED);
      socket.off(SocketEvents.GAME_STATE_RESPONSE);
    };
  }, [gameId]);

  const handleReady = () => {
    getSocket().emit(SocketEvents.PLAYER_READY);
  };

  const handleMove = (move: Move) => {
    getSocket().emit(SocketEvents.MAKE_MOVE, { move });
  };

  const handleNextRound = () => {
    getSocket().emit(SocketEvents.NEXT_ROUND);
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
