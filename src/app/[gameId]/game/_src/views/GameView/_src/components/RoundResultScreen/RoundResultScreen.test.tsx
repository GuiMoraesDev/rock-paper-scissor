import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState, RoundResult } from "@/lib/types";
import * as GameSSEProviderModule from "../../../../../../../_src/providers/GameSSEProvider";
import * as useNextRoundMutationModule from "../../../../../hooks/useNextRoundMutation";
import { RoundResultScreen } from "./RoundResultScreen";

vi.mock("../../../../../../../_src/providers/GameSSEProvider");
vi.mock("../../../../../hooks/useNextRoundMutation");

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  id: "ABC123",
  rounds: 3,
  currentRound: 1,
  status: "round-result",
  winner: undefined,
  players: [
    { name: "Player 1", ready: true, score: 0, hasChosen: false },
    { name: "Player 2", ready: true, score: 0, hasChosen: false },
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

const mockMutate = vi.fn();

const setupMocks = (
  game: GameState | null = createGameState(),
  lastRoundResult: RoundResult | null = createRoundResult(),
  playerIndex = 0,
) => {
  vi.mocked(GameSSEProviderModule.useGameSSE).mockReturnValue({
    game,
    playerIndex,
    lastRoundResult,
    rematchState: "idle",
    rematchRequesterName: "",
    markRematchSent: vi.fn(),
    markRematchCancelled: vi.fn(),
    error: null,
    setGameNotFound: vi.fn(),
  } as never);

  vi.mocked(useNextRoundMutationModule.useNextRoundMutation).mockReturnValue({
    mutate: mockMutate,
    isPending: false,
  } as never);
};

beforeEach(() => {
  vi.clearAllMocks();
});

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
    setupMocks(roundResultGame(), winResult);
    render(<RoundResultScreen gameId="ABC123" />);
    expect(screen.getByText("Round 1 Result")).toBeInTheDocument();
  });

  it("shows a win message when player wins the round", () => {
    setupMocks(roundResultGame(), winResult, 0);
    render(<RoundResultScreen gameId="ABC123" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-green-500");
  });

  it("shows a lose message when player loses the round", () => {
    setupMocks(roundResultGame(), winResult, 1);
    render(<RoundResultScreen gameId="ABC123" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-rps-red");
  });

  it("shows draw result with draw color", () => {
    setupMocks(
      roundResultGame(),
      createRoundResult({ winner: "draw", moves: ["rock", "rock"] }),
    );
    render(<RoundResultScreen gameId="ABC123" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-rps-yellow");
  });

  it("displays both player names", () => {
    setupMocks(roundResultGame(), winResult);
    render(<RoundResultScreen gameId="ABC123" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("displays move emojis", () => {
    setupMocks(roundResultGame(), winResult);
    render(<RoundResultScreen gameId="ABC123" />);
    expect(screen.getByText("🪨")).toBeInTheDocument();
    expect(screen.getByText("✂️")).toBeInTheDocument();
  });

  it("displays current scores", () => {
    setupMocks(roundResultGame(), winResult);
    render(<RoundResultScreen gameId="ABC123" />);
    expect(screen.getByText("Alice: 1")).toBeInTheDocument();
    expect(screen.getByText("Bob: 0")).toBeInTheDocument();
  });

  it("shows Next Round button when not last round", () => {
    setupMocks(roundResultGame(), winResult);
    render(<RoundResultScreen gameId="ABC123" />);
    expect(
      screen.getByRole("button", { name: /Next Round/ }),
    ).toBeInTheDocument();
  });

  it("calls mutate with gameId when Next Round button is clicked", () => {
    setupMocks(roundResultGame(), winResult);
    render(<RoundResultScreen gameId="ABC123" />);
    fireEvent.click(screen.getByRole("button", { name: /Next Round/ }));
    expect(mockMutate).toHaveBeenCalledWith({ gameId: "ABC123" });
  });

  it("hides Next Round button on last round", () => {
    setupMocks(
      { ...roundResultGame(), currentRound: 3 },
      createRoundResult({ round: 3 }),
    );
    render(<RoundResultScreen gameId="ABC123" />);
    expect(
      screen.queryByRole("button", { name: /Next Round/ }),
    ).not.toBeInTheDocument();
  });
});
