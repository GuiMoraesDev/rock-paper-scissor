import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import type { GameState, RoundResult } from "@/lib/types";
import { ResultsClient } from "./ResultsClient";

type RematchState = "idle" | "requested" | "received";

type ResultsContextValue = {
  game: GameState | null;
  playerIndex: number;
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

vi.mock("../../provider/ResultsProvider", () => ({
  useResults: () => {
    const ctx = useContext(ResultsContext);
    if (!ctx)
      throw new Error("useResults must be used within test ResultsProvider");
    return ctx;
  },
}));

const createRoundResult = (
  overrides: Partial<RoundResult> = {},
): RoundResult => ({
  round: 1,
  moves: ["rock", "scissors"],
  winner: "player1",
  ...overrides,
});

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  id: "ABC123",
  rounds: 3,
  currentRound: 3,
  status: "finished",
  winner: "player1",
  players: [
    { name: "Player 1", ready: false, score: 0, hasChosen: false },
    { name: "Player 2", ready: false, score: 0, hasChosen: false },
  ],
  roundResults: [],
  ...overrides,
});

type RenderOptions = {
  game?: GameState;
  playerIndex?: number;
  rematchState?: RematchState;
  rematchRequesterName?: string;
};

const renderWithResults = (ui: ReactNode, options: RenderOptions = {}) => {
  const testQueryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const context: ResultsContextValue = {
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
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

const finishedGame = (
  p1Score: number,
  p2Score: number,
  winner?: "player1" | "player2" | "draw",
) =>
  createGameState({
    winner:
      winner ??
      (p1Score > p2Score ? "player1" : p2Score > p1Score ? "player2" : "draw"),
    players: [
      { name: "Alice", ready: true, score: p1Score, hasChosen: false },
      { name: "Bob", ready: true, score: p2Score, hasChosen: false },
    ],
    roundResults: [
      createRoundResult({
        round: 1,
        moves: ["rock", "scissors"],
        winner: "player1",
      }),
      createRoundResult({
        round: 2,
        moves: ["paper", "rock"],
        winner: "player1",
      }),
      createRoundResult({
        round: 3,
        moves: ["scissors", "rock"],
        winner: "player2",
      }),
    ],
  });

describe("ResultsClient", () => {
  it("renders Game Over heading", () => {
    renderWithResults(<ResultsClient />, { game: finishedGame(2, 1) });
    expect(screen.getByText("Game Over!")).toBeInTheDocument();
  });

  it("shows You Win when player wins", () => {
    renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
      playerIndex: 0,
    });
    expect(screen.getByText(/You Win/)).toBeInTheDocument();
  });

  it("shows You Lose when player loses", () => {
    renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
      playerIndex: 1,
    });
    expect(screen.getByText(/You Lose/)).toBeInTheDocument();
  });

  it("shows tie when scores are equal", () => {
    renderWithResults(<ResultsClient />, { game: finishedGame(1, 1) });
    expect(screen.getByText(/Tie/)).toBeInTheDocument();
  });

  it("displays final scores", () => {
    renderWithResults(<ResultsClient />, { game: finishedGame(2, 1) });
    expect(screen.getByText("Alice: 2")).toBeInTheDocument();
    expect(screen.getByText("Bob: 1")).toBeInTheDocument();
  });

  it("renders round-by-round results", () => {
    renderWithResults(<ResultsClient />, { game: finishedGame(2, 1) });
    expect(screen.getByText("Round 1")).toBeInTheDocument();
    expect(screen.getByText("Round 2")).toBeInTheDocument();
    expect(screen.getByText("Round 3")).toBeInTheDocument();
  });

  it("shows move emojis in round results", () => {
    renderWithResults(<ResultsClient />, { game: finishedGame(2, 1) });
    expect(screen.getAllByText("🪨").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("📄").length).toBeGreaterThanOrEqual(1);
  });

  it("calls handlePlayAgain when back to home is clicked", () => {
    const { context } = renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
    });
    fireEvent.click(screen.getByTestId("back-home-button"));
    expect(context.handlePlayAgain).toHaveBeenCalledOnce();
  });

  it("shows rematch button in idle state", () => {
    renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
    });
    expect(screen.getByTestId("rematch-button")).toBeInTheDocument();
  });

  it("calls handleRequestRematch when rematch is clicked", () => {
    const { context } = renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
    });
    fireEvent.click(screen.getByTestId("rematch-button"));
    expect(context.handleRequestRematch).toHaveBeenCalledOnce();
  });

  it("shows waiting message when rematch is requested", () => {
    renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
      rematchState: "requested",
    });
    expect(
      screen.getByText("Waiting for opponent to accept..."),
    ).toBeInTheDocument();
  });

  it("shows accept/deny buttons when rematch is received", () => {
    renderWithResults(<ResultsClient />, {
      game: finishedGame(2, 1),
      rematchState: "received",
      rematchRequesterName: "Alice",
    });
    expect(screen.getByText("Alice wants a rematch!")).toBeInTheDocument();
    expect(screen.getByTestId("accept-rematch-button")).toBeInTheDocument();
    expect(screen.getByTestId("deny-rematch-button")).toBeInTheDocument();
  });
});
