import { vi } from "vitest";

export const createGame = vi.fn().mockResolvedValue(undefined);
export const joinGame = vi.fn().mockResolvedValue(undefined);
export const markPlayerReady = vi.fn().mockResolvedValue(undefined);
export const addAIPlayer = vi.fn().mockResolvedValue(undefined);
export const kickPlayer = vi.fn().mockResolvedValue(undefined);
