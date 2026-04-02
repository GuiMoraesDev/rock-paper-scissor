import { describe, expect, it } from "vitest";
import {
  generateAIMove,
  generateGameId,
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

describe("generateAIMove", () => {
  it("returns a valid move for easy difficulty with no history", () => {
    const validMoves = ["rock", "paper", "scissors"];
    for (let i = 0; i < 20; i++) {
      expect(validMoves).toContain(generateAIMove("easy", []));
    }
  });

  it("returns a valid move for easy difficulty regardless of history", () => {
    const validMoves = ["rock", "paper", "scissors"];
    for (let i = 0; i < 20; i++) {
      expect(validMoves).toContain(
        generateAIMove("easy", ["rock", "rock", "rock"]),
      );
    }
  });

  it("returns a valid move for normal difficulty with empty history", () => {
    const validMoves = ["rock", "paper", "scissors"];
    for (let i = 0; i < 20; i++) {
      expect(validMoves).toContain(generateAIMove("normal", []));
    }
  });

  it("tends to counter most frequent move on normal difficulty", () => {
    const history = Array(50).fill("rock");
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("normal", history),
    );
    const paperCount = moves.filter((m) => m === "paper").length;
    // Should counter rock with paper at least sometimes
    expect(paperCount).toBeGreaterThan(20);
  });

  it("strongly counters most frequent move on hard difficulty", () => {
    const history = Array(50).fill("scissors");
    const moves = Array.from({ length: 100 }, () =>
      generateAIMove("hard", history),
    );
    const rockCount = moves.filter((m) => m === "rock").length;
    // Hard mode should counter scissors with rock ~80% of the time
    expect(rockCount).toBeGreaterThan(60);
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
