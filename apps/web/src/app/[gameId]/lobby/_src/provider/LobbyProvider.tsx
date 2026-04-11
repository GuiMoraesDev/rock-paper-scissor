"use client";

import type { GameState } from "@rps/shared";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { createContext, type ReactNode, useCallback, useContext } from "react";
import { toast } from "@/components/atoms/Toaster";
import { clearPlayerToken } from "@/lib/game-api";
import { leaveGame as leaveGameService } from "@/services/game.api";
import {
  kickPlayer as kickPlayerService,
  markPlayerReady as playerReadyService,
} from "@/services/lobby.api";
import { useGameSSE } from "../../../_src/providers/GameSSEProvider";

type LobbyContextValue = {
  game: GameState | null;
  playerIndex: number;
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
  const { game, playerIndex } = useGameSSE();

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
