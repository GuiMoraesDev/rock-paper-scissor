import type { GameState, RoundResult } from "@rps/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";

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

import { createContext, useContext } from "react";

const ResultsContext = createContext<ResultsContextValue | null>(null);

vi.mock("../../../../provider/ResultsProvider", () => ({
  useResults: () => {
    const ctx = useContext(ResultsContext);
    if (!ctx)
      throw new Error("useResults must be used within test ResultsProvider");
    return ctx;
  },
}));

export const createGameState = (
  overrides: Partial<GameState> = {},
): GameState => ({
  id: "ABC123",
  rounds: 3,
  currentRound: 3,
  status: "finished",
  players: [
    { name: "Player 1", ready: false, score: 0, hasChosen: false },
    { name: "Player 2", ready: false, score: 0, hasChosen: false },
  ],
  roundResults: [],
  ...overrides,
});

export const createRoundResult = (
  overrides: Partial<RoundResult> = {},
): RoundResult => ({
  round: 1,
  moves: ["rock", "scissors"],
  winner: "player1",
  ...overrides,
});

type RenderOptions = {
  game?: GameState;
  playerIndex?: number;
  error?: string;
  rematchState?: RematchState;
  rematchRequesterName?: string;
};

export const renderWithResults = (
  ui: ReactNode,
  options: RenderOptions = {},
) => {
  const testQueryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const context: ResultsContextValue = {
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
    error: options.error ?? "",
    rematchState: options.rematchState ?? "idle",
    rematchRequesterName: options.rematchRequesterName ?? "",
    isRequestRematchPending: false,
    isAcceptRematchPending: false,
    isDenyRematchPending: false,
    handlePlayAgain: vi.fn(),
    handleRequestRematch: vi.fn(),
    handleAcceptRematch: vi.fn(),
    handleDenyRematch: vi.fn(),
  };

  const result = render(
    <QueryClientProvider client={testQueryClient}>
      <ResultsContext.Provider value={context}>{ui}</ResultsContext.Provider>
    </QueryClientProvider>,
  );

  return { ...result, context };
};
