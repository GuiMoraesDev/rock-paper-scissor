import type { Move } from "@rps/shared";
import { api } from "./api";

type MakeMovePayload = { gameId: string; move: Move };

export const makeMove = async ({
  gameId,
  move,
}: MakeMovePayload): Promise<void> => {
  return api.post(`/api/game/${gameId}/move`, { move });
};

type GameIdPayload = { gameId: string };

export const startNextRound = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  return api.post(`/api/game/${gameId}/next-round`);
};

export const leaveGame = async ({ gameId }: GameIdPayload): Promise<void> => {
  return api.post(`/api/game/${gameId}/leave`);
};

export const requestRematch = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  return api.post(`/api/game/${gameId}/rematch/request`);
};

export const acceptRematch = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  return api.post(`/api/game/${gameId}/rematch/accept`);
};

export const denyRematch = async ({ gameId }: GameIdPayload): Promise<void> => {
  return api.post(`/api/game/${gameId}/rematch/deny`);
};
