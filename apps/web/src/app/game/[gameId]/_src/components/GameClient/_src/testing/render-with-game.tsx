import type { GameState, Move, RoundResult } from "@rps/shared";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

type GameContextValue = {
  game: GameState | null;
  playerIndex: number;
  lastRoundResult: RoundResult | null;
  error: string;
  handleReady: () => void;
  handleMove: (move: Move) => void;
  handleNextRound: () => void;
  handlePlayAgain: () => void;
};

// Re-create a minimal context for testing without importing the real provider
// (avoids pulling in socket.io and router dependencies)
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
    status: "waiting",
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
};

export function renderWithGame(ui: ReactNode, options: RenderOptions = {}) {
  const context: GameContextValue = {
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
    lastRoundResult: options.lastRoundResult ?? null,
    error: options.error ?? "",
    handleReady: vi.fn(),
    handleMove: vi.fn(),
    handleNextRound: vi.fn(),
    handlePlayAgain: vi.fn(),
  };

  const result = render(
    <GameContext.Provider value={context}>{ui}</GameContext.Provider>,
  );

  return { ...result, context };
}
