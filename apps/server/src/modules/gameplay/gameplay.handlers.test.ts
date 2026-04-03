import { SocketEvents } from "@rps/shared";
import { beforeEach, describe, expect, it } from "vitest";
import { resetStore, setGame, setSocketMeta } from "../../shared/game.store.js";
import {
  createMockIo,
  createMockSocket,
  makeGame,
  makeTwoPlayerGame,
} from "../../shared/test-utils.js";
import { registerGameplayHandlers } from "./gameplay.handlers.js";

beforeEach(() => {
  resetStore();
});

describe("player-ready", () => {
  it("marks player as ready", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeGame();
    game.players.push({
      id: "socket-2",
      name: "Bob",
      ready: false,
      move: null,
      score: 0,
    });
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.PLAYER_READY);
    handler();

    expect(game.players[0].ready).toBe(true);
    expect(game.status).toBe("waiting");
  });

  it("transitions to playing when both players ready", () => {
    const { socket, getHandler } = createMockSocket("socket-2");
    const { io } = createMockIo();

    const game = makeGame();
    game.players[0].ready = true;
    game.players.push({
      id: "socket-2",
      name: "Bob",
      ready: false,
      move: null,
      score: 0,
    });
    setGame("GAME01", game);
    setSocketMeta("socket-2", { gameId: "GAME01", playerIndex: 1 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.PLAYER_READY);
    handler();

    expect(game.status).toBe("playing");
    expect(game.currentRound).toBe(1);
  });
});

describe("make-move", () => {
  it("records a player move", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame();
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.MAKE_MOVE);
    handler({ move: "rock" });

    expect(game.players[0].move).toBe("rock");
  });

  it("resolves round when both players have moved", () => {
    const { socket, getHandler } = createMockSocket("socket-2");
    const { io, roomEmit } = createMockIo();

    const game = makeTwoPlayerGame();
    game.players[0].move = "rock";
    setGame("GAME01", game);
    setSocketMeta("socket-2", { gameId: "GAME01", playerIndex: 1 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.MAKE_MOVE);
    handler({ move: "scissors" });

    expect(game.status).toBe("round-result");
    expect(game.players[0].score).toBe(1);
    expect(game.roundResults).toHaveLength(1);
    expect(game.roundResults[0].winner).toBe("player1");

    expect(roomEmit).toHaveBeenCalledWith(
      SocketEvents.ROUND_RESULT,
      expect.objectContaining({
        roundResult: expect.objectContaining({ winner: "player1" }),
      }),
    );
  });

  it("finishes the game on the last round", () => {
    const { socket, getHandler } = createMockSocket("socket-2");
    const { io, roomEmit } = createMockIo();

    const game = makeTwoPlayerGame({ rounds: 1, currentRound: 1 });
    game.players[0].move = "rock";
    setGame("GAME01", game);
    setSocketMeta("socket-2", { gameId: "GAME01", playerIndex: 1 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.MAKE_MOVE);
    handler({ move: "scissors" });

    expect(game.status).toBe("finished");
    expect(game.winner).toBe("player1");
    expect(roomEmit).toHaveBeenCalledWith(
      SocketEvents.GAME_FINISHED,
      expect.objectContaining({
        game: expect.objectContaining({
          status: "finished",
          winner: "player1",
        }),
      }),
    );
  });

  it("ignores move when game is not playing", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame({ status: "waiting" });
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.MAKE_MOVE);
    handler({ move: "rock" });

    expect(game.players[0].move).toBeNull();
  });
});

describe("next-round", () => {
  it("advances to the next round", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame({
      status: "round-result",
      currentRound: 1,
    });
    game.players[0].move = "rock";
    game.players[1].move = "scissors";
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.NEXT_ROUND);
    handler();

    expect(game.currentRound).toBe(2);
    expect(game.status).toBe("playing");
    expect(game.players[0].move).toBeNull();
    expect(game.players[1].move).toBeNull();
  });

  it("ignores when game is not in round-result", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame({ status: "playing", currentRound: 1 });
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerGameplayHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.NEXT_ROUND);
    handler();

    expect(game.currentRound).toBe(1);
  });
});
