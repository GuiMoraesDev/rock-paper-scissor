import type { GameState, Move, RoundResult } from "@rps/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import { RoundResultScreen } from "./RoundResultScreen";

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

vi.mock("../../../../../provider/GameProvider", () => ({
  useGame: () => {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be used within test GameProvider");
    return ctx;
  },
}));

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
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
});

const createRoundResult = (
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
  lastRoundResult?: RoundResult | null;
  rematchState?: RematchState;
  rematchRequesterName?: string;
};

const renderWithGame = (ui: ReactNode, options: RenderOptions = {}) => {
  const testQueryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });
  const context: GameContextValue = {
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
    lastRoundResult: options.lastRoundResult ?? null,
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
};

const roundResultGame = () =>
  createGameState({
    status: "round-result",
    rounds: 3,
    currentRound: 2,
    players: [
      { name: "Alice", ready: true, score: 1, hasChosen: false },
      { name: "Bob", ready: true, score: 0, hasChosen: false },
    ],
  });

const winResult = createRoundResult({
  round: 1,
  moves: ["rock", "scissors"],
  winner: "player1",
});

describe("RoundResultScreen", () => {
  it("renders round result heading", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("Round 1 Result")).toBeInTheDocument();
  });

  it("shows a win message when player wins the round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      playerIndex: 0,
      lastRoundResult: winResult,
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-green-500");
  });

  it("shows a lose message when player loses the round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      playerIndex: 1,
      lastRoundResult: winResult,
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-rps-red");
  });

  it("shows draw result with draw color", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: createRoundResult({
        winner: "draw",
        moves: ["rock", "rock"],
      }),
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-rps-yellow");
  });

  it("displays both player names", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("displays move emojis", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("🪨")).toBeInTheDocument();
    expect(screen.getByText("✂️")).toBeInTheDocument();
  });

  it("displays current scores", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("Alice: 1")).toBeInTheDocument();
    expect(screen.getByText("Bob: 0")).toBeInTheDocument();
  });

  it("shows Next Round button when not last round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(
      screen.getByRole("button", { name: /Next Round/ }),
    ).toBeInTheDocument();
  });

  it("calls handleNextRound when button is clicked", () => {
    const { context } = renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    fireEvent.click(screen.getByRole("button", { name: /Next Round/ }));
    expect(context.handleNextRound).toHaveBeenCalledOnce();
  });

  it("hides Next Round button on last round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: { ...roundResultGame(), currentRound: 3 },
      lastRoundResult: createRoundResult({ round: 3 }),
    });
    expect(
      screen.queryByRole("button", { name: /Next Round/ }),
    ).not.toBeInTheDocument();
  });
});
