import { SocketEvents } from "@rps/shared";
import { beforeEach, describe, expect, it } from "vitest";
import {
  getSocketMeta,
  resetStore,
  setGame,
  setSocketMeta,
} from "../../shared/game.store.js";
import {
  createMockIo,
  createMockSocket,
  makeTwoPlayerGame,
} from "../../shared/test-utils.js";
import { registerConnectionHandlers } from "./connection.handlers.js";

beforeEach(() => {
  resetStore();
});

describe("request-game-state", () => {
  it("returns game state for a valid player", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame();
    setGame("GAME01", game);

    registerConnectionHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.REQUEST_GAME_STATE);
    handler({ gameId: "GAME01" });

    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GAME_STATE_RESPONSE,
      expect.objectContaining({
        game: expect.objectContaining({ id: "GAME01" }),
        playerIndex: 0,
      }),
    );
  });

  it("returns null for non-existent game", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    registerConnectionHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.REQUEST_GAME_STATE);
    handler({ gameId: "NOPE" });

    expect(socket.emit).toHaveBeenCalledWith(SocketEvents.GAME_STATE_RESPONSE, {
      game: null,
      playerIndex: -1,
    });
  });

  it("returns null when socket is not a player in the game", () => {
    const { socket, getHandler } = createMockSocket("socket-99");
    const { io } = createMockIo();

    setGame("GAME01", makeTwoPlayerGame());

    registerConnectionHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.REQUEST_GAME_STATE);
    handler({ gameId: "GAME01" });

    expect(socket.emit).toHaveBeenCalledWith(SocketEvents.GAME_STATE_RESPONSE, {
      game: null,
      playerIndex: -1,
    });
  });

  it("returns full game state during round-result", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame({ status: "round-result" });
    game.players[0].move = "rock";
    game.players[1].move = "scissors";
    setGame("GAME01", game);

    registerConnectionHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.REQUEST_GAME_STATE);
    handler({ gameId: "GAME01" });

    const emittedGame = socket.emit.mock.calls.find(
      (c: unknown[]) => c[0] === SocketEvents.GAME_STATE_RESPONSE,
    )?.[1]?.game;

    expect(emittedGame.players[0].move).toBe("rock");
  });
});

describe("disconnect", () => {
  it("notifies opponent and cleans up socket meta", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io, roomEmit } = createMockIo();

    const game = makeTwoPlayerGame();
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerConnectionHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler("disconnect");
    handler();

    expect(roomEmit).toHaveBeenCalledWith(SocketEvents.PLAYER_DISCONNECTED, {
      playerName: "Alice",
    });
    expect(getSocketMeta("socket-1")).toBeUndefined();
  });

  it("does nothing when socket has no meta", () => {
    const { socket, getHandler } = createMockSocket("socket-unknown");
    const { io, roomEmit } = createMockIo();

    registerConnectionHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler("disconnect");
    handler();

    expect(roomEmit).not.toHaveBeenCalled();
  });
});
