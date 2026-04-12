import { fireEvent, render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as gameApiLib from "@/lib/game-api";
import type { GameState, RoundResult } from "@/lib/types";
import * as GameSSEProviderModule from "../../../../_src/providers/GameSSEProvider";
import * as useAcceptRematchMutationModule from "../../hooks/useAcceptRematchMutation";
import * as useDenyRematchMutationModule from "../../hooks/useDenyRematchMutation";
import * as useRequestRematchMutationModule from "../../hooks/useRequestRematchMutation";
import { ResultsClient } from "./ResultsClient";

vi.mock("../../../../_src/providers/GameSSEProvider");
vi.mock("../../hooks/useRequestRematchMutation");
vi.mock("../../hooks/useAcceptRematchMutation");
vi.mock("../../hooks/useDenyRematchMutation");
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/game-api");

const mockPush = vi.fn();
const mockRequestMutate = vi.fn();
const mockAcceptMutate = vi.fn();
const mockDenyMutate = vi.fn();
const mockMarkRematchSent = vi.fn();
const mockMarkRematchCancelled = vi.fn();

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
  rematchState?: "idle" | "requested" | "received";
  rematchRequesterName?: string;
  isRequestRematchPending?: boolean;
  isAcceptRematchPending?: boolean;
  isDenyRematchPending?: boolean;
};

const renderWithMocks = (options: RenderOptions = {}) => {
  vi.mocked(GameSSEProviderModule.useGameSSE).mockReturnValue({
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
    rematchState: options.rematchState ?? "idle",
    rematchRequesterName: options.rematchRequesterName ?? "",
    markRematchSent: mockMarkRematchSent,
    markRematchCancelled: mockMarkRematchCancelled,
    error: null,
    lastRoundResult: null,
    setGameNotFound: vi.fn(),
  } as never);

  vi.mocked(
    useRequestRematchMutationModule.useRequestRematchMutation,
  ).mockReturnValue({
    mutate: mockRequestMutate,
    isPending: options.isRequestRematchPending ?? false,
  } as never);

  vi.mocked(
    useAcceptRematchMutationModule.useAcceptRematchMutation,
  ).mockReturnValue({
    mutate: mockAcceptMutate,
    isPending: options.isAcceptRematchPending ?? false,
  } as never);

  vi.mocked(
    useDenyRematchMutationModule.useDenyRematchMutation,
  ).mockReturnValue({
    mutate: mockDenyMutate,
    isPending: options.isDenyRematchPending ?? false,
  } as never);

  return render(<ResultsClient gameId="ABC123" />);
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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: mockPush } as never);
});

describe("ResultsClient", () => {
  it("renders Game Over heading", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    expect(screen.getByText("Game Over!")).toBeInTheDocument();
  });

  it("shows You Win when player wins", () => {
    renderWithMocks({ game: finishedGame(2, 1), playerIndex: 0 });
    expect(screen.getByText(/You Win/)).toBeInTheDocument();
  });

  it("shows You Lose when player loses", () => {
    renderWithMocks({ game: finishedGame(2, 1), playerIndex: 1 });
    expect(screen.getByText(/You Lose/)).toBeInTheDocument();
  });

  it("shows tie when scores are equal", () => {
    renderWithMocks({ game: finishedGame(1, 1) });
    expect(screen.getByText(/Tie/)).toBeInTheDocument();
  });

  it("displays final scores", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    expect(screen.getByText("Alice: 2")).toBeInTheDocument();
    expect(screen.getByText("Bob: 1")).toBeInTheDocument();
  });

  it("renders round-by-round results", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    expect(screen.getByText("Round 1")).toBeInTheDocument();
    expect(screen.getByText("Round 2")).toBeInTheDocument();
    expect(screen.getByText("Round 3")).toBeInTheDocument();
  });

  it("shows move emojis in round results", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    expect(screen.getAllByText("🪨").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("📄").length).toBeGreaterThanOrEqual(1);
  });

  it("clears token and navigates home when back to home is clicked", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    fireEvent.click(screen.getByTestId("back-home-button"));
    expect(vi.mocked(gameApiLib.clearPlayerToken)).toHaveBeenCalledOnce();
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows rematch button in idle state", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    expect(screen.getByTestId("rematch-button")).toBeInTheDocument();
  });

  it("calls request rematch mutation when rematch is clicked", () => {
    renderWithMocks({ game: finishedGame(2, 1) });
    fireEvent.click(screen.getByTestId("rematch-button"));
    expect(mockRequestMutate).toHaveBeenCalledOnce();
  });

  it("shows waiting message when rematch is requested", () => {
    renderWithMocks({ game: finishedGame(2, 1), rematchState: "requested" });
    expect(
      screen.getByText("Waiting for opponent to accept..."),
    ).toBeInTheDocument();
  });

  it("shows accept/deny buttons when rematch is received", () => {
    renderWithMocks({
      game: finishedGame(2, 1),
      rematchState: "received",
      rematchRequesterName: "Alice",
    });
    expect(screen.getByText("Alice wants a rematch!")).toBeInTheDocument();
    expect(screen.getByTestId("accept-rematch-button")).toBeInTheDocument();
    expect(screen.getByTestId("deny-rematch-button")).toBeInTheDocument();
  });

  it("calls accept rematch mutation when accept is clicked", () => {
    renderWithMocks({ game: finishedGame(2, 1), rematchState: "received" });
    fireEvent.click(screen.getByTestId("accept-rematch-button"));
    expect(mockAcceptMutate).toHaveBeenCalledOnce();
  });

  it("calls deny rematch mutation when decline is clicked", () => {
    renderWithMocks({ game: finishedGame(2, 1), rematchState: "received" });
    fireEvent.click(screen.getByTestId("deny-rematch-button"));
    expect(mockDenyMutate).toHaveBeenCalledOnce();
  });
});
