import type { GameState, Move, RoundResult } from "@rps/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

type RematchState = "idle" | "requested" | "received";

type GameContextValue = {
  game: GameState | null;
  playerIndex: number;
  lastRoundResult: RoundResult | null;
  error: string;
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

// Re-create a minimal context for testing without importing the real provider
// (avoids pulling in SSE and router dependencies)
import { createContext, useContext } from "react";

const GameContext = createContext<GameContextValue | null>(null);

// Patch useGame to use our test context
vi.mock("../../../../provider/GameProvider", () => ({
  useGame: () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used within test GameProvider");
    return ctx;
  },
}));

export function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    id: "ABC123",
    rounds: 3,
    currentRound: 1,
    status: "playing",
    players: [
      { name: "Player 1", ready: false, score: 0, hasChosen: false },
      { name: "Player 2", ready: false, score: 0, hasChosen: false },
    ],
    roundResults: [],
    ...overrides,
  };
}

export function createRoundResult(
  overrides: Partial<RoundResult> = {},
): RoundResult {
  return {
    round: 1,
    moves: ["rock", "scissors"],
    winner: "player1",
    ...overrides,
  };
}

type RenderOptions = {
  game?: GameState;
  playerIndex?: number;
  lastRoundResult?: RoundResult | null;
  error?: string;
  rematchState?: RematchState;
  rematchRequesterName?: string;
};

export function renderWithGame(ui: ReactNode, options: RenderOptions = {}) {
  const testQueryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const context: GameContextValue = {
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
    lastRoundResult: options.lastRoundResult ?? null,
    error: options.error ?? "",
    rematchState: options.rematchState ?? "idle",
    rematchRequesterName: options.rematchRequesterName ?? "",
    isMovePending: false,
    isNextRoundPending: false,
    isRequestRematchPending: false,
    isAcceptRematchPending: false,
    isDenyRematchPending: false,
    handleMove: vi.fn(),
    handleNextRound: vi.fn(),
    handlePlayAgain: vi.fn(),
    handleLeaveGame: vi.fn(),
    handleRequestRematch: vi.fn(),
    handleAcceptRematch: vi.fn(),
    handleDenyRematch: vi.fn(),
  };

  const result = render(
    <QueryClientProvider client={testQueryClient}>
      <GameContext.Provider value={context}>{ui}</GameContext.Provider>
    </QueryClientProvider>,
  );

  return { ...result, context };
}
