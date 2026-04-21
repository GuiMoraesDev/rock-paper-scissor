import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "@/lib/types";
import * as GameSSEProviderModule from "../../../../_src/providers/GameSSEProvider";
import * as useAcceptRematchMutationModule from "../../hooks/useAcceptRematchMutation";
import * as useDenyRematchMutationModule from "../../hooks/useDenyRematchMutation";
import * as useRequestRematchMutationModule from "../../hooks/useRequestRematchMutation";
import { ResultsView } from "./ResultsView";

vi.mock("../../../../_src/providers/GameSSEProvider");
vi.mock("../../hooks/useRequestRematchMutation");
vi.mock("../../hooks/useAcceptRematchMutation");
vi.mock("../../hooks/useDenyRematchMutation");
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/game-api");

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  id: "ABC123",
  rounds: 3,
  currentRound: 3,
  status: "finished",
  winner: "player1",
  players: [
    { name: "Alice", ready: true, score: 2, hasChosen: false },
    { name: "Bob", ready: true, score: 1, hasChosen: false },
  ],
  roundResults: [],
  ...overrides,
});

const setupMocks = (game: GameState | null = createGameState()) => {
  vi.mocked(GameSSEProviderModule.useGameSSE).mockReturnValue({
    game,
    playerIndex: 0,
    rematchState: "idle",
    rematchRequesterName: "",
    markRematchSent: vi.fn(),
    markRematchCancelled: vi.fn(),
    error: null,
    lastRoundResult: null,
    setGameNotFound: vi.fn(),
  } as never);

  vi.mocked(
    useRequestRematchMutationModule.useRequestRematchMutation,
  ).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);

  vi.mocked(
    useAcceptRematchMutationModule.useAcceptRematchMutation,
  ).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);

  vi.mocked(
    useDenyRematchMutationModule.useDenyRematchMutation,
  ).mockReturnValue({ mutate: vi.fn(), isPending: false } as never);
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as never);
});

describe("ResultsView", () => {
  it("renders the finished screen when game is available", () => {
    setupMocks();
    render(<ResultsView gameId="ABC123" />);
    expect(screen.getByTestId("game-finished-screen")).toBeInTheDocument();
  });

  it("renders nothing when game is null", () => {
    setupMocks(null);
    const { container } = render(<ResultsView gameId="ABC123" />);
    expect(container).toBeEmptyDOMElement();
  });
});
