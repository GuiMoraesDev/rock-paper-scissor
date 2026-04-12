"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import { toast } from "@/components/atoms/Toaster";
import { clearPlayerToken } from "@/lib/game-api";
import type { GameState, Move, RoundResult } from "@/lib/types";
import {
  acceptRematch as acceptRematchService,
  denyRematch as denyRematchService,
  leaveGame as leaveGameService,
  makeMove as makeMoveService,
  startNextRound as nextRoundService,
  requestRematch as requestRematchService,
} from "@/services/game.api";
import { useGameSSE } from "../../../_src/providers/GameSSEProvider";

type RematchState = "idle" | "requested" | "received";

type GameContextValue = {
  game: GameState | null;
  playerIndex: number;
  lastRoundResult: RoundResult | null;
  rematchState: RematchState;
  rematchRequesterName: string;
  isMovePending: boolean;
  isNextRoundPending: boolean;
  isRequestRematchPending: boolean;
  isAcceptRematchPending: boolean;
  isDenyRematchPending: boolean;
  handleMove: (move: Move) => void;
  handleNextRound: () => void;
  handlePlayAgain: () => void;
  handleLeaveGame: () => void;
  handleRequestRematch: () => void;
  handleAcceptRematch: () => void;
  handleDenyRematch: () => void;
};

const GameContext = createContext<GameContextValue | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

type GameProviderProps = {
  gameId: string;
  children: ReactNode;
};

export const GameProvider = ({ gameId, children }: GameProviderProps) => {
  const router = useRouter();
  const {
    game,
    playerIndex,
    lastRoundResult,
    rematchState,
    rematchRequesterName,
    markRematchSent,
    markRematchCancelled,
  } = useGameSSE();

  const moveMutation = useMutation({
    mutationFn: (move: Move) => makeMoveService({ gameId, move }),
    onError: (err: Error) => toast.error(err.message),
  });

  const nextRoundMutation = useMutation({
    mutationFn: () => nextRoundService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });

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

  const handleLeaveGame = useCallback(() => {
    leaveGameService({ gameId });
    clearPlayerToken();
    router.push("/");
  }, [gameId, router]);

  const handlePlayAgain = useCallback(() => {
    router.push("/");
  }, [router]);

  return (
    <GameContext.Provider
      value={{
        game,
        playerIndex,
        lastRoundResult,
        rematchState,
        rematchRequesterName,
        isMovePending: moveMutation.isPending,
        isNextRoundPending: nextRoundMutation.isPending,
        isRequestRematchPending: requestRematchMutation.isPending,
        isAcceptRematchPending: acceptRematchMutation.isPending,
        isDenyRematchPending: denyRematchMutation.isPending,
        handleMove: moveMutation.mutate,
        handleNextRound: nextRoundMutation.mutate,
        handlePlayAgain,
        handleLeaveGame,
        handleRequestRematch: requestRematchMutation.mutate,
        handleAcceptRematch: acceptRematchMutation.mutate,
        handleDenyRematch: denyRematchMutation.mutate,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
