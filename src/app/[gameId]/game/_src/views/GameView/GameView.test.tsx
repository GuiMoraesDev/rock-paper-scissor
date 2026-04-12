import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "@/lib/types";
import * as GameSSEProviderModule from "../../../../_src/providers/GameSSEProvider";
import { GameView } from "./GameView";

vi.mock("../../../../_src/providers/GameSSEProvider");
vi.mock("./_src/components/GamePlay", () => ({
  GamePlay: () => <div data-testid="gameplay-screen" />,
}));
vi.mock("./_src/components/RoundResultScreen", () => ({
  RoundResultScreen: () => <div data-testid="round-result-screen" />,
}));

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
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GameView", () => {
  it("renders GamePlay when status is playing", () => {
    setupMocks(createGameState({ status: "playing" }));
    render(<GameView gameId="ABC123" />);
    expect(screen.getByTestId("gameplay-screen")).toBeInTheDocument();
  });

  it("renders RoundResultScreen when status is round-result", () => {
    setupMocks(createGameState({ status: "round-result" }));
    render(<GameView gameId="ABC123" />);
    expect(screen.getByTestId("round-result-screen")).toBeInTheDocument();
  });

  it("renders nothing when game is null", () => {
    setupMocks(null);
    const { container } = render(<GameView gameId="ABC123" />);
    expect(container).toBeEmptyDOMElement();
  });
});
