import type { AIDifficulty, GameState, Move } from "@/lib/types";
import { api } from "./api";

type CreateGamePayload = { playerName: string; rounds: number };
type CreateGameResponse = {
  gameId: string;
  playerToken: string;
  game: GameState;
};

export const createGame = async ({
  playerName,
  rounds,
}: CreateGamePayload): Promise<CreateGameResponse> => {
  const { data } = await api.post<CreateGameResponse>("/api/create", {
    playerName,
    rounds,
  });
  return data;
};

type JoinGamePayload = { gameId: string; playerName: string };
type JoinGameResponse = {
  gameId: string;
  playerToken: string;
  game: GameState;
};

export const joinGame = async ({
  gameId,
  playerName,
}: JoinGamePayload): Promise<JoinGameResponse> => {
  const { data } = await api.post<JoinGameResponse>("/api/join", {
    gameId: gameId.trim().toUpperCase(),
    playerName: playerName.trim(),
  });
  return data;
};

type GameIdPayload = { gameId: string };

export const markPlayerReady = async ({
  gameId,
}: GameIdPayload): Promise<void> => {
  await api.post(`/api/${gameId}/lobby/ready`);
};

type AddAIPayload = {
  gameId: string;
  difficulty: AIDifficulty;
  moveHistory: Move[];
};

export const addAIPlayer = async ({
  gameId,
  difficulty,
  moveHistory,
}: AddAIPayload): Promise<void> => {
  await api.post(`/api/${gameId}/lobby/add-ai`, { difficulty, moveHistory });
};

export const kickPlayer = async ({ gameId }: GameIdPayload): Promise<void> => {
  await api.post(`/api/${gameId}/lobby/kick`);
};

export const leaveGame = async ({ gameId }: GameIdPayload): Promise<void> => {
  await api.post(`/api/${gameId}/lobby/leave`);
};
