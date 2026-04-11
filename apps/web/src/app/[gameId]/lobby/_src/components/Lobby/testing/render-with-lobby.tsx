import type { GameState } from "@rps/shared";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { vi } from "vitest";
import { useLobby } from "../../../provider/LobbyProvider";

export function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    id: "ABC123",
    rounds: 3,
    currentRound: 1,
    status: "waiting",
    players: [
      { name: "Player 1", ready: false, score: 0, hasChosen: false },
      { name: "Player 2", ready: false, score: 0, hasChosen: false },
    ],
    roundResults: [],
    ...overrides,
  };
}

type RenderOptions = {
  game?: GameState;
  playerIndex?: number;
};

export function renderWithLobby(ui: ReactNode, options: RenderOptions = {}) {
  const testQueryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  });

  const context = {
    game: options.game ?? createGameState(),
    playerIndex: options.playerIndex ?? 0,
    isReadyPending: false,
    isKickPending: false,
    handleReady: vi.fn(),
    handleKickPlayer: vi.fn(),
    handleLeaveGame: vi.fn(),
  };

  vi.mocked(useLobby).mockReturnValue(context);

  const result = render(
    <QueryClientProvider client={testQueryClient}>{ui}</QueryClientProvider>,
  );

  return { ...result, context };
}
