"use client";

import {
  type GameState,
  type Move,
  type RoundResult,
  SocketEvents,
} from "@rps/shared";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { getSocket } from "@/lib/socket";

type GameContextValue = {
  game: GameState | null;
  playerIndex: number;
  lastRoundResult: RoundResult | null;
  error: string;
  gameNotFound: boolean;
  handleReady: () => void;
  handleMove: (move: Move) => void;
  handleNextRound: () => void;
  handlePlayAgain: () => void;
  handleLeaveGame: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}

type GameProviderProps = {
  gameId: string;
  children: ReactNode;
};

export function GameProvider({ gameId, children }: GameProviderProps) {
  const router = useRouter();

  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(
    null,
  );
  const [error, setError] = useState("");
  const [gameNotFound, setGameNotFound] = useState(false);

  useEffect(() => {
    const socket = getSocket();

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

    socket.emit(SocketEvents.REQUEST_GAME_STATE, { gameId });

    socket.on(
      SocketEvents.GAME_STATE_RESPONSE,
      ({ game, playerIndex: pIdx }) => {
        if (game && pIdx >= 0) {
          setGame(game);
          setPlayerIndex(pIdx);
        } else if (game && pIdx === -1) {
          router.push(`/join?code=${gameId}`);
        } else {
          setGameNotFound(true);
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
  }, [gameId, router]);

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

  const handleLeaveGame = () => {
    getSocket().emit(SocketEvents.LEAVE_GAME);
    router.push("/");
  };

  return (
    <GameContext.Provider
      value={{
        game,
        playerIndex,
        lastRoundResult,
        error,
        gameNotFound,
        handleReady,
        handleMove,
        handleNextRound,
        handlePlayAgain,
        handleLeaveGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
