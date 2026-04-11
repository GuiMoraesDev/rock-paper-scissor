"use client";

import type { GameState, Move, RoundResult } from "@rps/shared";
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
  leaveGame as leaveGameService,
  makeMove as makeMoveService,
  startNextRound as nextRoundService,
  requestRematch as requestRematchService,
} from "@/services/game.api";
import {
  kickPlayer as kickPlayerService,
  markPlayerReady as playerReadyService,
} from "@/services/lobby.api";
import { appendAIMoveHistory } from "../lib/ai-move-history";

type RematchState = "idle" | "requested" | "received";

type GameContextValue = {
  game: GameState | null;
  playerIndex: number;
  lastRoundResult: RoundResult | null;
  error: string;
  gameNotFound: boolean;
  rematchState: RematchState;
  rematchRequesterName: string;
  isReadyPending: boolean;
  isMovePending: boolean;
  isNextRoundPending: boolean;
  isRequestRematchPending: boolean;
  isAcceptRematchPending: boolean;
  isDenyRematchPending: boolean;
  isKickPending: boolean;
  handleReady: () => void;
  handleMove: (move: Move) => void;
  handleNextRound: () => void;
  handlePlayAgain: () => void;
  handleLeaveGame: () => void;
  handleRequestRematch: () => void;
  handleAcceptRematch: () => void;
  handleDenyRematch: () => void;
  handleKickPlayer: () => void;
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

    eventSource.addEventListener("round-result", (e) => {
      const { game: gameState, roundResult } = JSON.parse(e.data);
      setGame(gameState);
      setLastRoundResult(roundResult);

      const isAIGame = gameState.players.some((p: { name: string }) =>
        p.name.startsWith("AI ("),
      );
      if (isAIGame) {
        appendAIMoveHistory(roundResult.moves[0]);
      }
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

    eventSource.addEventListener("player-kicked", () => {
      clearPlayerToken();
      router.push("/");
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
      router.push(`/game/${newGameId}`);
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
  }, [gameId, router]);

  const readyMutation = useMutation({
    mutationFn: () => playerReadyService({ gameId }),
    onError: (err: Error) => toast.error(err.message),
  });

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

  const kickMutation = useMutation({
    mutationFn: () => kickPlayerService({ gameId }),
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
        error,
        gameNotFound,
        rematchState,
        rematchRequesterName,
        isReadyPending: readyMutation.isPending,
        isMovePending: moveMutation.isPending,
        isNextRoundPending: nextRoundMutation.isPending,
        isRequestRematchPending: requestRematchMutation.isPending,
        isAcceptRematchPending: acceptRematchMutation.isPending,
        isDenyRematchPending: denyRematchMutation.isPending,
        isKickPending: kickMutation.isPending,
        handleReady: readyMutation.mutate,
        handleMove: moveMutation.mutate,
        handleNextRound: nextRoundMutation.mutate,
        handlePlayAgain,
        handleLeaveGame,
        handleRequestRematch: requestRematchMutation.mutate,
        handleAcceptRematch: acceptRematchMutation.mutate,
        handleDenyRematch: denyRematchMutation.mutate,
        handleKickPlayer: kickMutation.mutate,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
