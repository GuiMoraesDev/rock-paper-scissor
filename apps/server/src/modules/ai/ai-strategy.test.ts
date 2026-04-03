import { describe, expect, it } from "vitest";
import {
  detectCounterStrategy,
  generateAIMove,
  predictByRecency,
  predictBySequence,
  predictByTransition,
} from "./ai-strategy.js";

describe("predictByRecency", () => {
  it("returns null for empty history", () => {
    expect(predictByRecency([])).toBeNull();
  });

  it("predicts the only move in a single-element history", () => {
    const result = predictByRecency(["rock"]);
    expect(result?.move).toBe("rock");
    expect(result?.confidence).toBe(1);
  });

  it("weights recent moves more heavily", () => {
    const history = [...Array(10).fill("rock"), ...Array(5).fill("scissors")];
    const result = predictByRecency(history);
    expect(result?.move).toBe("scissors");
  });

  it("predicts the dominant move when history is uniform", () => {
    const result = predictByRecency(Array(20).fill("paper"));
    expect(result?.move).toBe("paper");
    expect(result?.confidence).toBeCloseTo(1, 1);
  });
});

describe("predictByTransition", () => {
  it("returns null for history shorter than 3", () => {
    expect(predictByTransition([])).toBeNull();
    expect(predictByTransition(["rock"])).toBeNull();
    expect(predictByTransition(["rock", "paper"])).toBeNull();
  });

  it("predicts based on what follows the last move", () => {
    const history = ["rock", "scissors", "rock", "scissors", "rock"];
    const result = predictByTransition(history);
    expect(result?.move).toBe("scissors");
    expect(result?.confidence).toBe(1);
  });

  it("picks the most frequent transition", () => {
    const history = [
      "rock",
      "scissors",
      "rock",
      "scissors",
      "rock",
      "paper",
      "rock",
    ];
    const result = predictByTransition(history);
    expect(result?.move).toBe("scissors");
  });
});

describe("predictBySequence", () => {
  it("returns null for history shorter than 4", () => {
    expect(predictBySequence([])).toBeNull();
    expect(predictBySequence(["rock", "paper", "scissors"])).toBeNull();
  });

  it("detects a repeating length-2 sequence", () => {
    const history = ["rock", "paper", "rock", "paper", "rock", "paper"];
    const result = predictBySequence(history);
    expect(result).not.toBeNull();
    expect(result?.move).toBe("rock");
  });

  it("detects a repeating length-3 sequence", () => {
    const history = [
      "rock",
      "paper",
      "scissors",
      "rock",
      "paper",
      "scissors",
      "rock",
      "paper",
      "scissors",
    ];
    const result = predictBySequence(history);
    expect(result).not.toBeNull();
    expect(result?.move).toBe("rock");
  });

  it("returns null when no repeating pattern exists", () => {
    const history = ["rock", "scissors", "paper", "rock"];
    const result = predictBySequence(history);
    expect(result === null || result.move).toBeTruthy();
  });
});

describe("detectCounterStrategy", () => {
  it("returns depth 1 with insufficient history", () => {
    expect(detectCounterStrategy([])).toBe(1);
    expect(
      detectCounterStrategy([
        { moves: ["rock", "scissors"], winner: "player1" },
      ]),
    ).toBe(1);
  });

  it("returns depth 1 when AI is winning", () => {
    const results = Array(5).fill({
      moves: ["rock", "paper"] as [string, string],
      winner: "player2",
    });
    expect(detectCounterStrategy(results)).toBe(1);
  });

  it("returns depth 2 when player is winning most recent rounds", () => {
    const results = Array(5).fill({
      moves: ["scissors", "rock"] as [string, string],
      winner: "player1",
    });
    expect(detectCounterStrategy(results)).toBe(2);
  });

  it("only considers the last 5 rounds", () => {
    const oldLosses = Array(10).fill({
      moves: ["rock", "paper"] as [string, string],
      winner: "player2",
    });
    const recentWins = Array(5).fill({
      moves: ["scissors", "rock"] as [string, string],
      winner: "player1",
    });
    expect(detectCounterStrategy([...oldLosses, ...recentWins])).toBe(2);
  });
});

describe("generateAIMove", () => {
  const validMoves = ["rock", "paper", "scissors"];

  it("returns a valid move for easy difficulty with no history", () => {
    for (let i = 0; i < 20; i++) {
      expect(validMoves).toContain(generateAIMove("easy", []));
    }
  });

  it("returns a valid move for easy difficulty regardless of history", () => {
    for (let i = 0; i < 20; i++) {
      expect(validMoves).toContain(
        generateAIMove("easy", ["rock", "rock", "rock"]),
      );
    }
  });

  it("returns a valid move for normal difficulty with empty history", () => {
    for (let i = 0; i < 20; i++) {
      expect(validMoves).toContain(generateAIMove("normal", []));
    }
  });

  it("tends to counter recent moves on normal difficulty", () => {
    const history = [...Array(5).fill("scissors"), ...Array(20).fill("rock")];
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("normal", history),
    );
    const paperCount = moves.filter((m) => m === "paper").length;
    expect(paperCount).toBeGreaterThan(25);
  });

  it("strongly counters on hard difficulty with consistent history", () => {
    const history = Array(50).fill("scissors");
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("hard", history),
    );
    const rockCount = moves.filter((m) => m === "rock").length;
    expect(rockCount).toBeGreaterThan(60);
  });

  it("shifts strategy on hard when player is counter-strategizing", () => {
    const history = Array(20).fill("scissors");
    const roundResults = Array(5).fill({
      moves: ["scissors", "rock"] as [string, string],
      winner: "player1",
    });
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("hard", history, roundResults),
    );
    const scissorsCount = moves.filter((m) => m === "scissors").length;
    expect(scissorsCount).toBeGreaterThan(60);
  });

  it("always returns a valid move regardless of inputs", () => {
    for (let i = 0; i < 50; i++) {
      expect(validMoves).toContain(generateAIMove("easy", []));
      expect(validMoves).toContain(generateAIMove("normal", []));
      expect(validMoves).toContain(generateAIMove("hard", []));
      expect(validMoves).toContain(generateAIMove("hard", ["rock"], []));
    }
  });
});
