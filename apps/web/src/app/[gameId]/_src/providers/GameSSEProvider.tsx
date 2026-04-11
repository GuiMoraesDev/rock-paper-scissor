"use client";

import type { GameState, Move, RoundResult } from "@rps/shared";
import { usePathname, useRouter } from "next/navigation";
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
  clearPlayerToken,
  getAIMoveHistory,
  getPlayerToken,
  setPlayerToken,
} from "@/lib/game-api";
import { useGameNotFound } from "./GameNotFoundProvider";

const STORAGE_KEY = "rps-ai-move-history";

const connectToGame = ({
  gameId,
  token,
}: {
  gameId: string;
  token: string;
}): EventSource => {
  const url = `/api/game/${gameId}/events?token=${encodeURIComponent(token)}`;
  return new EventSource(url);
};

const appendAIMoveHistory = ({ move }: { move: Move }): void => {
  try {
    const history = getAIMoveHistory();
    history.push(move);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // sessionStorage unavailable (SSR, private browsing)
  }
};

type RematchState = "idle" | "requested" | "received";

type GameSSEContextValue = {
  game: GameState | null;
  playerIndex: number;
  error: string;
  lastRoundResult: RoundResult | null;
  rematchState: RematchState;
  rematchRequesterName: string;
  markRematchSent: () => void;
  markRematchCancelled: () => void;
};

const GameSSEContext = createContext<GameSSEContextValue | null>(null);

export const useGameSSE = () => {
  const context = useContext(GameSSEContext);
  if (!context) {
    throw new Error("useGameSSE must be used within a GameSSEProvider");
  }
  return context;
};

type GameSSEProviderProps = {
  gameId: string;
  children: ReactNode;
};

export const GameSSEProvider = ({ gameId, children }: GameSSEProviderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { setGameNotFound } = useGameNotFound();

  const [game, setGame] = useState<GameState | null>(null);
  const [playerIndex, setPlayerIndex] = useState<number>(-1);
  const [error, setError] = useState("");
  const [lastRoundResult, setLastRoundResult] = useState<RoundResult | null>(
    null,
  );
  const [rematchState, setRematchState] = useState<RematchState>("idle");
  const [rematchRequesterName, setRematchRequesterName] = useState("");

  const pathnameRef = useRef(pathname);
  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  const resolveRoute = useCallback(
    ({ status }: { status: GameState["status"] }): string | null => {
      if (status === "waiting" || status === "ready") return `/${gameId}/lobby`;
      if (status === "playing" || status === "round-result")
        return `/${gameId}/game`;
      if (status === "finished") return `/${gameId}/results`;
      return null;
    },
    [gameId],
  );

  useEffect(() => {
    const token = getPlayerToken();
    if (!token) {
      router.push(`/join?code=${gameId}`);
      return;
    }

    const eventSource = connectToGame({ gameId, token });

    eventSource.addEventListener("game-state", (e) => {
      const { game: gameState, playerIndex: pIdx } = JSON.parse(e.data);

      if (!gameState || pIdx < 0) {
        setGameNotFound(true);
        return;
      }

      setGame(gameState);
      setPlayerIndex(pIdx);

      const target = resolveRoute({ status: gameState.status });

      if (target && target !== pathnameRef.current) {
        router.push(target);
      }
    });

    eventSource.addEventListener("game-updated", (e) => {
      const { game: gameState } = JSON.parse(e.data);

      setGame(gameState);

      const target = resolveRoute({ status: gameState.status });

      if (target && target !== pathnameRef.current) {
        router.push(target);
      }
    });

    eventSource.addEventListener("round-result", (e) => {
      const { game: gameState, roundResult } = JSON.parse(e.data);

      setGame(gameState);
      setLastRoundResult(roundResult);

      const isAIGame = gameState.players.some((p: { name: string }) =>
        p.name.startsWith("AI ("),
      );

      if (isAIGame) {
        appendAIMoveHistory({ move: roundResult.moves[0] });
      }
    });

    eventSource.addEventListener("game-finished", (e) => {
      const { game: gameState } = JSON.parse(e.data);

      if (gameState) setGame(gameState);

      if (pathnameRef.current !== `/${gameId}/results`) {
        router.push(`/${gameId}/results`);
      }
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

      router.push(`/${newGameId}/lobby`);
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

    eventSource.onerror = () => {
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection lost. Please refresh the page.");
      }
    };

    return () => {
      eventSource.close();
    };
  }, [gameId, router, setGameNotFound, resolveRoute]);

  const markRematchSent = useCallback(() => {
    setRematchState("requested");
  }, []);

  const markRematchCancelled = useCallback(() => {
    setRematchState("idle");
  }, []);

  return (
    <GameSSEContext.Provider
      value={{
        game,
        playerIndex,
        error,
        lastRoundResult,
        rematchState,
        rematchRequesterName,
        markRematchSent,
        markRematchCancelled,
      }}
    >
      {children}
    </GameSSEContext.Provider>
  );
};
