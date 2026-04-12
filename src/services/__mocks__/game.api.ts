import { vi } from "vitest";

export const makeMove = vi.fn().mockResolvedValue(undefined);
export const startNextRound = vi.fn().mockResolvedValue(undefined);
export const leaveGame = vi.fn().mockResolvedValue(undefined);
export const requestRematch = vi.fn().mockResolvedValue(undefined);
export const acceptRematch = vi.fn().mockResolvedValue(undefined);
export const denyRematch = vi.fn().mockResolvedValue(undefined);
