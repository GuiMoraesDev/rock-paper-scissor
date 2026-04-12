import type { Move } from "@/lib/types";
import { api } from "./api";

type MakeMovePayload = { gameId: string; move: Move };

export const makeMove = async ({
  gameId,
  move,
}: MakeMovePayload): Promise<void> => {
  return api.post(`/api/${gameId}/game/move`, { move });
};

type GameIdPayload = { gameId: string };

export const startNextRound = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  return api.post(`/api/${gameId}/game/next-round`);
};
