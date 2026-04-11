import { act, fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Lobby } from "./Lobby";
import { createGameState, renderWithLobby } from "./testing/render-with-lobby";

vi.mock("../../provider/LobbyProvider", () => ({
  useLobby: vi.fn(),
}));

const mockAddAIPlayer = vi.fn().mockResolvedValue(undefined);
vi.mock("@/services/lobby.api", () => ({
  addAIPlayer: (...args: unknown[]) => mockAddAIPlayer(...args),
}));

describe("Lobby", () => {
  it("renders the game code", () => {
    renderWithLobby(<Lobby />);
    expect(screen.getByText("ABC123")).toBeInTheDocument();
  });

  it("displays both player names", () => {
    renderWithLobby(<Lobby />);
    expect(screen.getByText(/Player 1/)).toBeInTheDocument();
    expect(screen.getByText(/Player 2/)).toBeInTheDocument();
  });

  it("shows rounds info", () => {
    renderWithLobby(<Lobby />);
    expect(screen.getByText("Best of 3 rounds")).toBeInTheDocument();
  });

  it("shows singular round for best of 1", () => {
    renderWithLobby(<Lobby />, {
      game: createGameState({ rounds: 1 }),
    });
    expect(screen.getByText("Best of 1 round")).toBeInTheDocument();
  });

  it("shows waiting for opponent when only one player", () => {
    renderWithLobby(<Lobby />, {
      game: createGameState({
        players: [
          { name: "Player 1", ready: false, score: 0, hasChosen: false },
        ],
      }),
    });
    expect(screen.getByText("Waiting for opponent...")).toBeInTheDocument();
  });

  it("disables ready button when only one player", () => {
    renderWithLobby(<Lobby />, {
      game: createGameState({
        players: [
          { name: "Player 1", ready: false, score: 0, hasChosen: false },
        ],
      }),
    });
    expect(screen.getByRole("button", { name: /Ready/ })).toBeDisabled();
  });

  it("calls handleReady when ready button is clicked", () => {
    const { context } = renderWithLobby(<Lobby />);
    fireEvent.click(screen.getByRole("button", { name: /Ready/ }));
    expect(context.handleReady).toHaveBeenCalledOnce();
  });

  it("shows waiting message when player is ready", () => {
    renderWithLobby(<Lobby />, {
      game: createGameState({
        players: [
          { name: "Player 1", ready: true, score: 0, hasChosen: false },
          { name: "Player 2", ready: false, score: 0, hasChosen: false },
        ],
      }),
    });
    expect(
      screen.getByText("Waiting for opponent to be ready..."),
    ).toBeInTheDocument();
  });

  it("copies game code to clipboard on click", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    renderWithLobby(<Lobby />);
    fireEvent.click(screen.getByTitle("Click to copy"));
    expect(writeText).toHaveBeenCalledWith("ABC123");
  });

  it("shows AI button when waiting for opponent as creator", () => {
    renderWithLobby(<Lobby />, {
      game: createGameState({
        players: [
          { name: "Player 1", ready: false, score: 0, hasChosen: false },
        ],
      }),
      playerIndex: 0,
    });
    expect(screen.getByTestId("add-ai-button")).toBeInTheDocument();
  });

  it("does not show AI button for non-creator", () => {
    renderWithLobby(<Lobby />, {
      game: createGameState({
        players: [
          { name: "Player 1", ready: false, score: 0, hasChosen: false },
        ],
      }),
      playerIndex: 1,
    });
    expect(screen.queryByTestId("add-ai-button")).not.toBeInTheDocument();
  });

  it("opens AI difficulty modal and calls addAIPlayer on selection", async () => {
    mockAddAIPlayer.mockClear();
    renderWithLobby(<Lobby />, {
      game: createGameState({
        players: [
          { name: "Player 1", ready: false, score: 0, hasChosen: false },
        ],
      }),
      playerIndex: 0,
    });

    fireEvent.click(screen.getByTestId("add-ai-button"));
    expect(screen.getByText("Choose Difficulty")).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(screen.getByTestId("ai-difficulty-hard"));
    });

    expect(mockAddAIPlayer).toHaveBeenCalledWith(
      { gameId: "ABC123", difficulty: "hard", moveHistory: [] },
      expect.anything(),
    );
  });
});
