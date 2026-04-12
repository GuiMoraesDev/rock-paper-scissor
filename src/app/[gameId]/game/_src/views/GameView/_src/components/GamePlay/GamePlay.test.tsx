import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "@/lib/types";
import * as GameSSEProviderModule from "../../../../../../../_src/providers/GameSSEProvider";
import * as useMakeMovesMutationModule from "../../../../../hooks/useMakeMovesMutation";
import { GamePlay } from "./GamePlay";

vi.mock("../../../../../../../_src/providers/GameSSEProvider");
vi.mock("../../../../../hooks/useMakeMovesMutation");

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  id: "ABC123",
  rounds: 3,
  currentRound: 1,
  status: "playing",
  winner: undefined,
  players: [
    { name: "Player 1", ready: true, score: 0, hasChosen: false },
    { name: "Player 2", ready: true, score: 0, hasChosen: false },
  ],
  roundResults: [],
  ...overrides,
});

const mockMutate = vi.fn();

const setupMocks = (
  game: GameState | null = createGameState(),
  playerIndex = 0,
) => {
  vi.mocked(GameSSEProviderModule.useGameSSE).mockReturnValue({
    game,
    playerIndex,
    rematchState: "idle",
    rematchRequesterName: "",
    markRematchSent: vi.fn(),
    markRematchCancelled: vi.fn(),
    error: null,
    lastRoundResult: null,
    setGameNotFound: vi.fn(),
  } as never);

  vi.mocked(useMakeMovesMutationModule.useMakeMovesMutation).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as never);
};

beforeEach(() => {
  vi.clearAllMocks();
});

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
    setupMocks(playingGame());
    render(<GamePlay gameId="ABC123" />);
    expect(screen.getByText("Round 2 of 3")).toBeInTheDocument();
  });

  it("renders move heading", () => {
    setupMocks(playingGame());
    render(<GamePlay gameId="ABC123" />);
    expect(screen.getByText("Make your move!")).toBeInTheDocument();
  });

  it("displays player scores", () => {
    setupMocks(playingGame());
    render(<GamePlay gameId="ABC123" />);
    expect(screen.getByText("Alice: 1")).toBeInTheDocument();
    expect(screen.getByText("Bob: 0")).toBeInTheDocument();
  });

  it("renders three move buttons", () => {
    setupMocks(playingGame());
    render(<GamePlay gameId="ABC123" />);
    expect(screen.getByText("🪨")).toBeInTheDocument();
    expect(screen.getByText("📄")).toBeInTheDocument();
    expect(screen.getByText("✂️")).toBeInTheDocument();
  });

  it("calls mutate with gameId and move when a move is clicked", () => {
    setupMocks(playingGame());
    render(<GamePlay gameId="ABC123" />);
    fireEvent.click(screen.getByText("🪨"));
    expect(mockMutate).toHaveBeenCalledWith({ gameId: "ABC123", move: "rock" });
  });

  it("does not call mutate again if player already chose", () => {
    const game = playingGame();
    game.players[0].hasChosen = true;
    setupMocks(game);
    render(<GamePlay gameId="ABC123" />);
    fireEvent.click(screen.getByText("🪨"));
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("shows waiting for opponent message", () => {
    setupMocks(playingGame());
    render(<GamePlay gameId="ABC123" />);
    expect(screen.getByText(/Waiting for opponent/)).toBeInTheDocument();
  });

  it("shows opponent has chosen when they have", () => {
    const game = playingGame();
    game.players[1].hasChosen = true;
    setupMocks(game);
    render(<GamePlay gameId="ABC123" />);
    expect(screen.getByText(/Opponent has chosen/)).toBeInTheDocument();
  });

  it("disables move buttons after player has chosen", () => {
    const game = playingGame();
    game.players[0].hasChosen = true;
    setupMocks(game);
    render(<GamePlay gameId="ABC123" />);
    const buttons = screen.getAllByRole("button");
    for (const button of buttons) {
      expect(button).toBeDisabled();
    }
  });
});
