import { SocketEvents } from "@rps/shared";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getSocketMeta,
  resetStore,
  setGame,
  setSocketMeta,
} from "./game-store.js";
import { registerSocketHandlers } from "./socket-handlers.js";
import type { Game } from "./types.js";

type Handler = (...args: unknown[]) => void;

function createMockSocket(id = "socket-1") {
  const handlers = new Map<string, Handler>();
  const socket = {
    id,
    on: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, handler);
    }),
    emit: vi.fn(),
    join: vi.fn(),
  };

  function getHandler(event: string): Handler {
    const handler = handlers.get(event);
    if (!handler) throw new Error(`No handler registered for "${event}"`);
    return handler;
  }

  return { socket, getHandler };
}

function createMockIo() {
  const roomEmit = vi.fn();
  const io = {
    to: vi.fn(() => ({ emit: roomEmit })),
    sockets: {
      adapter: {
        rooms: new Map<string, Set<string>>(),
      },
    },
  };
  return { io, roomEmit };
}

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "GAME01",
    rounds: 3,
    currentRound: 0,
    players: [
      { id: "socket-1", name: "Alice", ready: false, move: null, score: 0 },
    ],
    roundResults: [],
    status: "waiting",
    ...overrides,
  };
}

function makeTwoPlayerGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "GAME01",
    rounds: 3,
    currentRound: 1,
    players: [
      { id: "socket-1", name: "Alice", ready: true, move: null, score: 0 },
      { id: "socket-2", name: "Bob", ready: true, move: null, score: 0 },
    ],
    roundResults: [],
    status: "playing",
    ...overrides,
  };
}

beforeEach(() => {
  resetStore();
});

describe("create-game", () => {
  it("creates a game and emits game-created", () => {
    const { socket, getHandler } = createMockSocket();
    const { io } = createMockIo();

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket2 as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

    const handler = getHandler(SocketEvents.JOIN_GAME);
    handler({ gameId: "GAME01", playerName: "Charlie" });

    expect(socket.emit).toHaveBeenCalledWith(SocketEvents.ERROR_MSG, {
      message: "Game already started!",
    });
  });
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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

    const handler = getHandler(SocketEvents.NEXT_ROUND);
    handler();

    expect(game.currentRound).toBe(1);
  });
});

describe("request-game-state", () => {
  it("returns game state for a valid player", () => {
    const { socket, getHandler } = createMockSocket("socket-1");
    const { io } = createMockIo();

    const game = makeTwoPlayerGame();
    setGame("GAME01", game);

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

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

    registerSocketHandlers(io as never, socket as never);

    const handler = getHandler("disconnect");
    handler();

    expect(roomEmit).not.toHaveBeenCalled();
  });
});
