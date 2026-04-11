"use client";

import type { GameState } from "@rps/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "@/components/atoms/Toaster";
import {
  clearPlayerToken,
  connectToGame,
  getPlayerToken,
} from "@/lib/game-api";
import { leaveGame as leaveGameService } from "@/services/game.api";
import {
  kickPlayer as kickPlayerService,
  markPlayerReady as playerReadyService,
} from "@/services/lobby.api";
import { useGameNotFound } from "../../../_src/providers/GameNotFoundProvider";

type LobbyContextValue = {
  game: GameState | null;
  playerIndex: number;
  error: string;
  isReadyPending: boolean;
  isKickPending: boolean;
  handleReady: () => void;
  handleKickPlayer: () => void;
  handleLeaveGame: () => void;
};

const LobbyContext = createContext<LobbyContextValue | null>(null);

export const useLobby = () => {
  const context = useContext(LobbyContext);
  if (!context) {
    throw new Error("useLobby must be used within a LobbyProvider");
  }
  return context;
};

type LobbyProviderProps = {
  gameId: string;
  children: ReactNode;
};

export const LobbyProvider = ({ gameId, children }: LobbyProviderProps) => {
  const router = useRouter();
  const { setGameNotFound } = useGameNotFound();

  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [error, setError] = useState("");
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      router.push(`/join?code=${gameId}`);
      return;
    }

    const eventSource = connectToGame(gameId, token);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener("game-state", (e) => {
      const { game: gameState, playerIndex: pIdx } = JSON.parse(e.data);
      if (gameState && pIdx >= 0) {
        if (
          gameState.status === "playing" ||
          gameState.status === "round-result" ||
          gameState.status === "finished"
        ) {
          eventSource.close();
          router.push(`/${gameId}/game`);
          return;
        }
        setGame(gameState);
        setPlayerIndex(pIdx);
      } else {
        setGameNotFound(true);
      }
    });

    eventSource.addEventListener("game-updated", (e) => {
      const { game: gameState } = JSON.parse(e.data);
      if (
        gameState.status === "playing" ||
        gameState.status === "round-result" ||
        gameState.status === "finished"
      ) {
        eventSource.close();
        router.push(`/${gameId}/game`);
        return;
      }
      setGame(gameState);
    });

    eventSource.addEventListener("error-msg", (e) => {
      const { message } = JSON.parse(e.data);
      setError(message);
      setTimeout(() => setError(""), 3000);
    });

    eventSource.addEventListener("player-disconnected", (e) => {
      const { playerName } = JSON.parse(e.data);
      setError(`${playerName} disconnected!`);
    });

    eventSource.addEventListener("player-kicked", () => {
      clearPlayerToken();
      router.push("/");
    });

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection lost. Please refresh the page.");
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [gameId, router, setGameNotFound]);

  const readyMutation = useMutation({
    mutationFn: () => playerReadyService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });

  const kickMutation = useMutation({
    mutationFn: () => kickPlayerService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });

  const handleLeaveGame = useCallback(() => {
    leaveGameService({ gameId });
    clearPlayerToken();
    router.push("/");
  }, [gameId, router]);

  return (
    <LobbyContext.Provider
      value={{
        game,
        playerIndex,
        error,
        isReadyPending: readyMutation.isPending,
        isKickPending: kickMutation.isPending,
        handleReady: readyMutation.mutate,
        handleKickPlayer: kickMutation.mutate,
        handleLeaveGame,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};
