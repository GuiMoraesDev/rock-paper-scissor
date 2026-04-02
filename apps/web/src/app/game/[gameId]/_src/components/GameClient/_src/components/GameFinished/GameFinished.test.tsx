import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createGameState,
  createRoundResult,
  renderWithGame,
} from "../../testing/render-with-game";
import { GameFinished } from "./GameFinished";

const finishedGame = (
  p1Score: number,
  p2Score: number,
  winner?: "player1" | "player2" | "draw",
) =>
  createGameState({
    status: "finished",
    rounds: 3,
    currentRound: 3,
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

describe("GameFinished", () => {
  it("renders Game Over heading", () => {
    renderWithGame(<GameFinished />, { game: finishedGame(2, 1) });
    expect(screen.getByText("Game Over!")).toBeInTheDocument();
  });

  it("shows You Win when player wins", () => {
    renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
      playerIndex: 0,
    });
    expect(screen.getByText(/You Win/)).toBeInTheDocument();
  });

  it("shows You Lose when player loses", () => {
    renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
      playerIndex: 1,
    });
    expect(screen.getByText(/You Lose/)).toBeInTheDocument();
  });

  it("shows tie when scores are equal", () => {
    renderWithGame(<GameFinished />, { game: finishedGame(1, 1) });
    expect(screen.getByText(/Tie/)).toBeInTheDocument();
  });

  it("displays final scores", () => {
    renderWithGame(<GameFinished />, { game: finishedGame(2, 1) });
    expect(screen.getByText("Alice: 2")).toBeInTheDocument();
    expect(screen.getByText("Bob: 1")).toBeInTheDocument();
  });

  it("renders round-by-round results", () => {
    renderWithGame(<GameFinished />, { game: finishedGame(2, 1) });
    expect(screen.getByText("Round 1")).toBeInTheDocument();
    expect(screen.getByText("Round 2")).toBeInTheDocument();
    expect(screen.getByText("Round 3")).toBeInTheDocument();
  });

  it("shows move emojis in round results", () => {
    renderWithGame(<GameFinished />, { game: finishedGame(2, 1) });
    expect(screen.getAllByText("🪨").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("📄").length).toBeGreaterThanOrEqual(1);
  });

  it("calls handlePlayAgain when back to home is clicked", () => {
    const { context } = renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
    });
    fireEvent.click(screen.getByTestId("back-home-button"));
    expect(context.handlePlayAgain).toHaveBeenCalledOnce();
  });

  it("shows rematch button in idle state", () => {
    renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
    });
    expect(screen.getByTestId("rematch-button")).toBeInTheDocument();
  });

  it("calls handleRequestRematch when rematch is clicked", () => {
    const { context } = renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
    });
    fireEvent.click(screen.getByTestId("rematch-button"));
    expect(context.handleRequestRematch).toHaveBeenCalledOnce();
  });

  it("shows waiting message when rematch is requested", () => {
    renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
      rematchState: "requested",
    });
    expect(
      screen.getByText("Waiting for opponent to accept..."),
    ).toBeInTheDocument();
  });

  it("shows accept/deny buttons when rematch is received", () => {
    renderWithGame(<GameFinished />, {
      game: finishedGame(2, 1),
      rematchState: "received",
      rematchRequesterName: "Alice",
    });
    expect(screen.getByText("Alice wants a rematch!")).toBeInTheDocument();
    expect(screen.getByTestId("accept-rematch-button")).toBeInTheDocument();
    expect(screen.getByTestId("deny-rematch-button")).toBeInTheDocument();
  });
});
