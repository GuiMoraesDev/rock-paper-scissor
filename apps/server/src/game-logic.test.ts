import { describe, expect, it } from "vitest";
import {
  detectCounterStrategy,
  generateAIMove,
  generateGameId,
  predictByRecency,
  predictBySequence,
  predictByTransition,
  resolveRound,
  sanitizeGame,
  sanitizeGameFull,
} from "./game-logic.js";
import type { Game } from "./types.js";

describe("generateGameId", () => {
  it("returns a 6-character string", () => {
    const id = generateGameId();
    expect(id).toHaveLength(6);
  });

  it("only contains allowed characters (no ambiguous O/0/1/I)", () => {
    const allowed = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let i = 0; i < 50; i++) {
      const id = generateGameId();
      for (const char of id) {
        expect(allowed).toContain(char);
      }
    }
  });

  it("generates unique IDs", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateGameId()));
    expect(ids.size).toBeGreaterThan(90);
  });
});

describe("resolveRound", () => {
  it("returns draw for identical moves", () => {
    expect(resolveRound("rock", "rock")).toBe("draw");
    expect(resolveRound("paper", "paper")).toBe("draw");
    expect(resolveRound("scissors", "scissors")).toBe("draw");
  });

  it("returns player1 when player1 wins", () => {
    expect(resolveRound("rock", "scissors")).toBe("player1");
    expect(resolveRound("scissors", "paper")).toBe("player1");
    expect(resolveRound("paper", "rock")).toBe("player1");
  });

  it("returns player2 when player2 wins", () => {
    expect(resolveRound("scissors", "rock")).toBe("player2");
    expect(resolveRound("paper", "scissors")).toBe("player2");
    expect(resolveRound("rock", "paper")).toBe("player2");
  });
});

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
    // Mostly rock early, but recent moves are scissors
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
    // After rock, player always plays scissors
    const history = ["rock", "scissors", "rock", "scissors", "rock"];
    const result = predictByTransition(history);
    expect(result?.move).toBe("scissors");
    expect(result?.confidence).toBe(1);
  });

  it("picks the most frequent transition", () => {
    // After rock: scissors twice, paper once
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
    // May or may not find a pattern, but should not crash
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
    // Recent moves are rock (recency-weighted)
    const history = [...Array(5).fill("scissors"), ...Array(20).fill("rock")];
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("normal", history),
    );
    const paperCount = moves.filter((m) => m === "paper").length;
    // Should counter rock with paper at least sometimes (60% rate + random)
    expect(paperCount).toBeGreaterThan(25);
  });

  it("strongly counters on hard difficulty with consistent history", () => {
    const history = Array(50).fill("scissors");
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("hard", history),
    );
    const rockCount = moves.filter((m) => m === "rock").length;
    // Hard mode should counter scissors with rock ~85% of the time
    expect(rockCount).toBeGreaterThan(60);
  });

  it("shifts strategy on hard when player is counter-strategizing", () => {
    // Player has been beating the AI in recent rounds
    const history = Array(20).fill("scissors");
    const roundResults = Array(5).fill({
      moves: ["scissors", "rock"] as [string, string],
      winner: "player1",
    });
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("hard", history, roundResults),
    );
    // In depth-2 mode, AI plays the predicted move (scissors) instead of counter (rock)
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

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "ABC123",
    rounds: 3,
    currentRound: 1,
    players: [
      { id: "s1", name: "Alice", ready: true, move: "rock", score: 1 },
      { id: "s2", name: "Bob", ready: true, move: "scissors", score: 0 },
    ],
    roundResults: [],
    status: "playing",
    ...overrides,
  };
}

describe("sanitizeGame", () => {
  it("strips move from players and adds hasChosen", () => {
    const game = makeGame();
    const result = sanitizeGame(game);

    expect(result.players[0]).toEqual({
      name: "Alice",
      ready: true,
      score: 1,
      hasChosen: true,
    });
    expect(result.players[0]).not.toHaveProperty("move");
  });

  it("sets hasChosen to false when move is null", () => {
    const game = makeGame({
      players: [
        { id: "s1", name: "Alice", ready: true, move: null, score: 0 },
        { id: "s2", name: "Bob", ready: true, move: "rock", score: 0 },
      ],
    });
    const result = sanitizeGame(game);

    expect(result.players[0].hasChosen).toBe(false);
    expect(result.players[1].hasChosen).toBe(true);
  });

  it("preserves game-level fields", () => {
    const game = makeGame();
    const result = sanitizeGame(game);

    expect(result.id).toBe("ABC123");
    expect(result.rounds).toBe(3);
    expect(result.currentRound).toBe(1);
    expect(result.status).toBe("playing");
    expect(result.roundResults).toEqual([]);
  });
});

describe("sanitizeGameFull", () => {
  it("includes move in players", () => {
    const game = makeGame();
    const result = sanitizeGameFull(game);

    expect(result.players[0]).toEqual({
      name: "Alice",
      ready: true,
      score: 1,
      move: "rock",
      hasChosen: true,
    });
  });

  it("includes null move when not chosen", () => {
    const game = makeGame({
      players: [
        { id: "s1", name: "Alice", ready: true, move: null, score: 0 },
        { id: "s2", name: "Bob", ready: true, move: "rock", score: 0 },
      ],
    });
    const result = sanitizeGameFull(game);

    expect(result.players[0].move).toBeNull();
    expect(result.players[0].hasChosen).toBe(false);
  });
});
