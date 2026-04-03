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
  makeGame,
  makeTwoPlayerGame,
} from "../../shared/test-utils.js";
import { registerLobbyHandlers } from "./lobby.handlers.js";

beforeEach(() => {
  resetStore();
});

describe("create-game", () => {
  it("creates a game and emits game-created", () => {
    const { socket, getHandler } = createMockSocket();
    const { io } = createMockIo();

    registerLobbyHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.CREATE_GAME);
    handler({ playerName: "Alice", rounds: 3 });

    expect(socket.join).toHaveBeenCalled();
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.GAME_CREATED,
      expect.objectContaining({
        gameId: expect.any(String),
        game: expect.objectContaining({
          rounds: 3,
          status: "waiting",
        }),
      }),
    );

    const meta = getSocketMeta("socket-1");
    expect(meta).toEqual({ gameId: expect.any(String), playerIndex: 0 });
  });
});

describe("join-game", () => {
  it("adds player 2 to an existing game", () => {
    const { socket: socket2, getHandler } = createMockSocket("socket-2");
    const { io, roomEmit } = createMockIo();

    const game = makeGame();
    setGame("GAME01", game);
    setSocketMeta("socket-1", { gameId: "GAME01", playerIndex: 0 });

    registerLobbyHandlers({ io: io as never, socket: socket2 as never });

    const handler = getHandler(SocketEvents.JOIN_GAME);
    handler({ gameId: "GAME01", playerName: "Bob" });

    expect(game.players).toHaveLength(2);
    expect(game.players[1].name).toBe("Bob");
    expect(socket2.join).toHaveBeenCalledWith("GAME01");
    expect(socket2.emit).toHaveBeenCalledWith(
      SocketEvents.JOINED_GAME,
      expect.objectContaining({ gameId: "GAME01" }),
    );
    expect(roomEmit).toHaveBeenCalledWith(
      SocketEvents.GAME_UPDATED,
      expect.anything(),
    );
  });

  it("emits error when game not found", () => {
    const { socket, getHandler } = createMockSocket();
    const { io } = createMockIo();

    registerLobbyHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.JOIN_GAME);
    handler({ gameId: "NOPE", playerName: "Bob" });

    expect(socket.emit).toHaveBeenCalledWith(SocketEvents.ERROR_MSG, {
      message: "Game not found!",
    });
  });

  it("emits error when game is full", () => {
    const { socket, getHandler } = createMockSocket("socket-3");
    const { io } = createMockIo();

    setGame("GAME01", makeTwoPlayerGame());

    registerLobbyHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.JOIN_GAME);
    handler({ gameId: "GAME01", playerName: "Charlie" });

    expect(socket.emit).toHaveBeenCalledWith(SocketEvents.ERROR_MSG, {
      message: "Game is full!",
    });
  });

  it("emits error when game already started", () => {
    const { socket, getHandler } = createMockSocket("socket-3");
    const { io } = createMockIo();

    const game = makeGame({ status: "playing" });
    setGame("GAME01", game);

    registerLobbyHandlers({ io: io as never, socket: socket as never });

    const handler = getHandler(SocketEvents.JOIN_GAME);
    handler({ gameId: "GAME01", playerName: "Charlie" });

    expect(socket.emit).toHaveBeenCalledWith(SocketEvents.ERROR_MSG, {
      message: "Game already started!",
    });
  });
});
