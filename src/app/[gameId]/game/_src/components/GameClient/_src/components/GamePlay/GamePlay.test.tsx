import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { createContext, useContext } from "react";
import { describe, expect, it, vi } from "vitest";
import type { GameState, Move, RoundResult } from "@/lib/types";
import { GamePlay } from "./GamePlay";

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

const playingGame = () =>
  createGameState({
    status: "playing",
    currentRound: 2,
    rounds: 3,
    players: [
      { name: "Alice", ready: true, score: 1, hasChosen: false },
      { name: "Bob", ready: true, score: 0, hasChosen: false },
    ],
  });

describe("GamePlay", () => {
  it("renders round info", () => {
    renderWithGame(<GamePlay />, { game: playingGame() });
    expect(screen.getByText("Round 2 of 3")).toBeInTheDocument();
  });

  it("renders move heading", () => {
    renderWithGame(<GamePlay />, { game: playingGame() });
    expect(screen.getByText("Make your move!")).toBeInTheDocument();
  });

  it("displays player scores", () => {
    renderWithGame(<GamePlay />, { game: playingGame() });
    expect(screen.getByText("Alice: 1")).toBeInTheDocument();
    expect(screen.getByText("Bob: 0")).toBeInTheDocument();
  });

  it("renders three move buttons", () => {
    renderWithGame(<GamePlay />, { game: playingGame() });
    expect(screen.getByText("🪨")).toBeInTheDocument();
    expect(screen.getByText("📄")).toBeInTheDocument();
    expect(screen.getByText("✂️")).toBeInTheDocument();
  });

  it("calls handleMove when a move is clicked", () => {
    const { context } = renderWithGame(<GamePlay />, { game: playingGame() });
    fireEvent.click(screen.getByText("🪨"));
    expect(context.handleMove).toHaveBeenCalledWith("rock");
  });

  it("does not call handleMove again if already chosen", () => {
    const game = playingGame();
    game.players[0].hasChosen = true;
    const { context } = renderWithGame(<GamePlay />, { game });
    fireEvent.click(screen.getByText("🪨"));
    expect(context.handleMove).not.toHaveBeenCalled();
  });

  it("shows waiting for opponent message", () => {
    renderWithGame(<GamePlay />, { game: playingGame() });
    expect(screen.getByText(/Waiting for opponent/)).toBeInTheDocument();
  });

  it("shows opponent has chosen when they have", () => {
    const game = playingGame();
    game.players[1].hasChosen = true;
    renderWithGame(<GamePlay />, { game });
    expect(screen.getByText(/Opponent has chosen/)).toBeInTheDocument();
  });

  it("disables move buttons after player has chosen", () => {
    const game = playingGame();
    game.players[0].hasChosen = true;
    renderWithGame(<GamePlay />, { game });
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });
});
