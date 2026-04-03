import { beforeEach, describe, expect, it } from "vitest";
import {
  deleteGame,
  deleteSocketMeta,
  getGame,
  getSocketMeta,
  hasGame,
  resetStore,
  setGame,
  setSocketMeta,
} from "./game.store.js";
import type { Game } from "./types.js";

function makeGame(id = "GAME01"): Game {
  return {
    id,
    rounds: 3,
    currentRound: 0,
    players: [{ id: "s1", name: "Alice", ready: false, move: null, score: 0 }],
    roundResults: [],
    status: "waiting",
  };
}

beforeEach(() => {
  resetStore();
});

describe("game operations", () => {
  it("stores and retrieves a game", () => {
    const game = makeGame();
    setGame("GAME01", game);
    expect(getGame("GAME01")).toBe(game);
  });

  it("returns undefined for missing game", () => {
    expect(getGame("NOPE")).toBeUndefined();
  });

  it("checks game existence with hasGame", () => {
    expect(hasGame("GAME01")).toBe(false);
    setGame("GAME01", makeGame());
    expect(hasGame("GAME01")).toBe(true);
  });

  it("deletes a game", () => {
    setGame("GAME01", makeGame());
    deleteGame("GAME01");
    expect(getGame("GAME01")).toBeUndefined();
    expect(hasGame("GAME01")).toBe(false);
  });
});

describe("socketMeta operations", () => {
  it("stores and retrieves socket meta", () => {
    const meta = { gameId: "GAME01", playerIndex: 0 };
    setSocketMeta("socket1", meta);
    expect(getSocketMeta("socket1")).toBe(meta);
  });

  it("returns undefined for missing socket meta", () => {
    expect(getSocketMeta("nope")).toBeUndefined();
  });

  it("deletes socket meta", () => {
    setSocketMeta("socket1", { gameId: "GAME01", playerIndex: 0 });
    deleteSocketMeta("socket1");
    expect(getSocketMeta("socket1")).toBeUndefined();
  });
});

describe("resetStore", () => {
  it("clears all games and socket meta", () => {
    setGame("GAME01", makeGame());
    setSocketMeta("socket1", { gameId: "GAME01", playerIndex: 0 });

    resetStore();

    expect(getGame("GAME01")).toBeUndefined();
    expect(getSocketMeta("socket1")).toBeUndefined();
  });
});
