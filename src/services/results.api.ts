import { api } from "./api";

type GameIdPayload = { gameId: string };

export const requestRematch = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  return api.post(`/api/${gameId}/results/rematch/request`);
};

export const acceptRematch = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  return api.post(`/api/${gameId}/results/rematch/accept`);
};

export const denyRematch = async ({ gameId }: GameIdPayload): Promise<void> => {
  return api.post(`/api/${gameId}/results/rematch/deny`);
};
