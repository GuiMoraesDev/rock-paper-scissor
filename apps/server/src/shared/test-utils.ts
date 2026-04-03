import { vi } from "vitest";
import type { Game } from "./types.js";

type Handler = (...args: unknown[]) => void;

export function createMockSocket(id = "socket-1") {
  const handlers = new Map<string, Handler>();
  const socket = {
    id,
    on: vi.fn((event: string, handler: Handler) => {
      handlers.set(event, handler);
    }),
    emit: vi.fn(),
    join: vi.fn(),
    leave: vi.fn(),
    to: vi.fn(() => ({ emit: vi.fn() })),
  };

  function getHandler(event: string): Handler {
    const handler = handlers.get(event);
    if (!handler) throw new Error(`No handler registered for "${event}"`);
    return handler;
  }

  return { socket, getHandler };
}

export function createMockIo() {
  const roomEmit = vi.fn();
  const io = {
    to: vi.fn(() => ({ emit: roomEmit })),
    sockets: {
      sockets: new Map(),
      adapter: {
        rooms: new Map<string, Set<string>>(),
      },
    },
  };
  return { io, roomEmit };
}

export function makeGame(overrides: Partial<Game> = {}): Game {
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

export function makeTwoPlayerGame(overrides: Partial<Game> = {}): Game {
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
