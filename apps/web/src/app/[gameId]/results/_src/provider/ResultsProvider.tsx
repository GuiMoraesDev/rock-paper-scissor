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
  setPlayerToken,
} from "@/lib/game-api";
import {
  acceptRematch as acceptRematchService,
  denyRematch as denyRematchService,
  requestRematch as requestRematchService,
} from "@/services/game.api";
import { useGameNotFound } from "../../../_src/providers/GameNotFoundProvider";

type RematchState = "idle" | "requested" | "received";

type ResultsContextValue = {
  game: GameState | null;
  playerIndex: number;
  error: string;
  rematchState: RematchState;
  rematchRequesterName: string;
  isRequestRematchPending: boolean;
  isAcceptRematchPending: boolean;
  isDenyRematchPending: boolean;
  handlePlayAgain: () => void;
  handleRequestRematch: () => void;
  handleAcceptRematch: () => void;
  handleDenyRematch: () => void;
};

const ResultsContext = createContext<ResultsContextValue | null>(null);

export const useResults = () => {
  const context = useContext(ResultsContext);
  if (!context) {
    throw new Error("useResults must be used within a ResultsProvider");
  }
  return context;
};

type ResultsProviderProps = {
  gameId: string;
  children: ReactNode;
};

export const ResultsProvider = ({ gameId, children }: ResultsProviderProps) => {
  const router = useRouter();
  const { setGameNotFound } = useGameNotFound();

  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [error, setError] = useState("");
  const [rematchState, setRematchState] = useState<RematchState>("idle");
  const [rematchRequesterName, setRematchRequesterName] = useState("");
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
        if (gameState.status === "waiting" || gameState.status === "ready") {
          eventSource.close();
          router.push(`/${gameId}/lobby`);
          return;
        }
        if (
          gameState.status === "playing" ||
          gameState.status === "round-result"
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
      setGame(gameState);
    });

    eventSource.addEventListener("game-finished", (e) => {
      const { game: gameState } = JSON.parse(e.data);
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

    eventSource.addEventListener("rematch-requested", (e) => {
      const { playerName } = JSON.parse(e.data);
      setRematchState("received");
      setRematchRequesterName(playerName);
    });

    eventSource.addEventListener("rematch-denied", (e) => {
      const { playerName } = JSON.parse(e.data);
      setRematchState("idle");
      setError(`${playerName} declined the rematch.`);
    });

    eventSource.addEventListener("rematch-game-created", (e) => {
      const { gameId: newGameId, playerToken: newToken } = JSON.parse(e.data);
      if (newToken) {
        setPlayerToken(newToken, newGameId);
      }
      setRematchState("idle");
      eventSource.close();
      router.push(`/${newGameId}/lobby`);
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

  const requestRematchMutation = useMutation({
    mutationFn: () => requestRematchService({ gameId }),
    onSuccess: () => setRematchState("requested"),
    onError: (err: Error) => toast.error(err.message),
  });

  const acceptRematchMutation = useMutation({
    mutationFn: () => acceptRematchService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });

  const denyRematchMutation = useMutation({
    mutationFn: () => denyRematchService({ gameId }),
    onSuccess: () => setRematchState("idle"),
    onError: (err: Error) => toast.error(err.message),
  });

  const handlePlayAgain = useCallback(() => {
    clearPlayerToken();
    router.push("/");
  }, [router]);

  return (
    <ResultsContext.Provider
      value={{
        game,
        playerIndex,
        error,
        rematchState,
        rematchRequesterName,
        isRequestRematchPending: requestRematchMutation.isPending,
        isAcceptRematchPending: acceptRematchMutation.isPending,
        isDenyRematchPending: denyRematchMutation.isPending,
        handlePlayAgain,
        handleRequestRematch: requestRematchMutation.mutate,
        handleAcceptRematch: acceptRematchMutation.mutate,
        handleDenyRematch: denyRematchMutation.mutate,
      }}
    >
      {children}
    </ResultsContext.Provider>
  );
};
