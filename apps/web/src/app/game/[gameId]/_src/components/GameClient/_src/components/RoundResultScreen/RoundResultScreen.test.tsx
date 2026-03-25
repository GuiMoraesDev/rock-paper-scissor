import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  createGameState,
  createRoundResult,
  renderWithGame,
} from "../../testing/render-with-game";
import { RoundResultScreen } from "./RoundResultScreen";

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
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("Round 1 Result")).toBeInTheDocument();
  });

  it("shows a win message when player wins the round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      playerIndex: 0,
      lastRoundResult: winResult,
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-green-500");
  });

  it("shows a lose message when player loses the round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      playerIndex: 1,
      lastRoundResult: winResult,
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-rps-red");
  });

  it("shows draw result with draw color", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: createRoundResult({
        winner: "draw",
        moves: ["rock", "rock"],
      }),
    });
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading.className).toContain("text-rps-yellow");
  });

  it("displays both player names", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("displays move emojis", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("🪨")).toBeInTheDocument();
    expect(screen.getByText("✂️")).toBeInTheDocument();
  });

  it("displays current scores", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(screen.getByText("Alice: 1")).toBeInTheDocument();
    expect(screen.getByText("Bob: 0")).toBeInTheDocument();
  });

  it("shows Next Round button when not last round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    expect(
      screen.getByRole("button", { name: /Next Round/ }),
    ).toBeInTheDocument();
  });

  it("calls handleNextRound when button is clicked", () => {
    const { context } = renderWithGame(<RoundResultScreen />, {
      game: roundResultGame(),
      lastRoundResult: winResult,
    });
    fireEvent.click(screen.getByRole("button", { name: /Next Round/ }));
    expect(context.handleNextRound).toHaveBeenCalledOnce();
  });

  it("hides Next Round button on last round", () => {
    renderWithGame(<RoundResultScreen />, {
      game: { ...roundResultGame(), currentRound: 3 },
      lastRoundResult: createRoundResult({ round: 3 }),
    });
    expect(
      screen.queryByRole("button", { name: /Next Round/ }),
    ).not.toBeInTheDocument();
  });
});
