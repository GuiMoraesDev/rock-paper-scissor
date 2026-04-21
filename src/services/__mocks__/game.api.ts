import { vi } from "vitest";

export const makeMove = vi.fn().mockResolvedValue(undefined);
export const startNextRound = vi.fn().mockResolvedValue(undefined);
