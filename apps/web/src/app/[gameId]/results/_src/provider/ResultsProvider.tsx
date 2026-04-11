"use client";

import type { GameState } from "@rps/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import { toast } from "@/components/atoms/Toaster";
import { clearPlayerToken } from "@/lib/game-api";
import {
  acceptRematch as acceptRematchService,
  denyRematch as denyRematchService,
  requestRematch as requestRematchService,
} from "@/services/game.api";
import { useGameSSE } from "../../../_src/providers/GameSSEProvider";

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
  const {
    game,
    playerIndex,
    error,
    rematchState,
    rematchRequesterName,
    markRematchSent,
    markRematchCancelled,
  } = useGameSSE();

  const requestRematchMutation = useMutation({
    mutationFn: () => requestRematchService({ gameId }),
    onSuccess: markRematchSent,
    onError: (err: Error) => toast.error(err.message),
  });

  const acceptRematchMutation = useMutation({
    mutationFn: () => acceptRematchService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });

  const denyRematchMutation = useMutation({
    mutationFn: () => denyRematchService({ gameId }),
    onSuccess: markRematchCancelled,
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
