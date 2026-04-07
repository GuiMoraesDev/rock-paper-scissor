"use client";

import type { GameState, Move, RoundResult } from "@rps/shared";
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
import {
  acceptRematch as acceptRematchApi,
  clearPlayerToken,
  connectToGame,
  denyRematch as denyRematchApi,
  getPlayerToken,
  kickPlayer as kickPlayerApi,
  leaveGame as leaveGameApi,
  makeMove as makeMoveApi,
  nextRound as nextRoundApi,
  playerReady as playerReadyApi,
  requestRematch as requestRematchApi,
  setPlayerToken,
} from "@/lib/game-api";
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
      // No token means user hasn't created/joined — redirect to join
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

      // Store the new token for the new game
      if (newToken) {
        setPlayerToken(newToken, newGameId);
      }

      setRematchState("idle");
      eventSource.close();
      router.push(`/game/${newGameId}`);
    });

    eventSource.onerror = () => {
      // EventSource auto-reconnects on error
      // Only set error if connection is fully closed
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection lost. Please refresh the page.");
      }
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [gameId, router]);

  const handleReady = useCallback(() => {
    playerReadyApi(gameId);
  }, [gameId]);

  const handleMove = useCallback(
    (move: Move) => {
      makeMoveApi(gameId, move);
    },
    [gameId],
  );

  const handleNextRound = useCallback(() => {
    nextRoundApi(gameId);
  }, [gameId]);

  const handlePlayAgain = useCallback(() => {
    router.push("/");
  }, [router]);

  const handleLeaveGame = useCallback(() => {
    leaveGameApi(gameId);
    clearPlayerToken();
    router.push("/");
  }, [gameId, router]);

  const handleRequestRematch = useCallback(() => {
    requestRematchApi(gameId);
    setRematchState("requested");
  }, [gameId]);

  const handleAcceptRematch = useCallback(() => {
    acceptRematchApi(gameId);
  }, [gameId]);

  const handleDenyRematch = useCallback(() => {
    denyRematchApi(gameId);
    setRematchState("idle");
  }, [gameId]);

  const handleKickPlayer = useCallback(() => {
    kickPlayerApi(gameId);
  }, [gameId]);

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
        handleReady,
        handleMove,
        handleNextRound,
        handlePlayAgain,
        handleLeaveGame,
        handleRequestRematch,
        handleAcceptRematch,
        handleDenyRematch,
        handleKickPlayer,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
