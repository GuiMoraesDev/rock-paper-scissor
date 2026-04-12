import { render, screen } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GameState } from "@/lib/types";
import * as GameSSEProviderModule from "../../../../_src/providers/GameSSEProvider";
import { LobbyView } from "./LobbyView";

vi.mock("../../../../_src/providers/GameSSEProvider");
vi.mock("./_src/components/ReadyButton", () => ({
  ReadyButton: () => <button type="button">Ready</button>,
}));
vi.mock("./_src/components/KickPlayerButton", () => ({
  KickPlayerButton: () => <button type="button">Kick</button>,
}));
vi.mock("./_src/components/AddAIButton", () => ({
  AddAIButton: () => <button type="button">Add AI</button>,
}));
vi.mock("next/navigation", () => ({ useRouter: vi.fn() }));
vi.mock("@/lib/game-api");
vi.mock("@/services/game.api");

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  id: "ABC123",
  rounds: 3,
  currentRound: 1,
  status: "waiting",
  winner: undefined,
  players: [
    { name: "Player 1", ready: false, score: 0, hasChosen: false },
    { name: "Player 2", ready: false, score: 0, hasChosen: false },
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
  vi.mocked(useRouter).mockReturnValue({ push: vi.fn() } as never);
});

describe("LobbyView", () => {
  it("renders the lobby screen when game is available", () => {
    setupMocks();
    render(<LobbyView gameId="ABC123" />);
    expect(screen.getByTestId("lobby-screen")).toBeInTheDocument();
  });

  it("renders nothing when game is null", () => {
    setupMocks(null);
    const { container } = render(<LobbyView gameId="ABC123" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("displays the game code", () => {
    setupMocks();
    render(<LobbyView gameId="ABC123" />);
    expect(screen.getByTestId("game-code")).toHaveTextContent("ABC123");
  });

  it("displays both player names", () => {
    setupMocks();
    render(<LobbyView gameId="ABC123" />);
    expect(screen.getByText(/Player 1/)).toBeInTheDocument();
    expect(screen.getByText(/Player 2/)).toBeInTheDocument();
  });
});
