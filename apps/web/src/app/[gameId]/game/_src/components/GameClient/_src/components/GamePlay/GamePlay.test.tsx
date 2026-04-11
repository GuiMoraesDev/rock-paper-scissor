import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createGameState,
  renderWithGame,
} from "../../testing/render-with-game";
import { GamePlay } from "./GamePlay";

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
