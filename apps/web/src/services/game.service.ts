import type { AIDifficulty, GameState, Move } from "@rps/shared";
import { getPlayerToken } from "@/lib/game-api";

export type CreateGamePayload = { playerName: string; rounds: number };
export type CreateGameResponse = {
  gameId: string;
  playerToken: string;
  game: GameState;
};

export type JoinGamePayload = { gameId: string; playerName: string };
export type JoinGameResponse = {
  gameId: string;
  playerToken: string;
  game: GameState;
};

export type AddAIPayload = {
  gameId: string;
  difficulty: AIDifficulty;
  moveHistory: Move[];
};

async function postAction(
  url: string,
  body?: Record<string, unknown>,
): Promise<void> {
  const token = getPlayerToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Player-Token": token } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Request failed");
  }
}

export async function createGame({
  playerName,
  rounds,
}: CreateGamePayload): Promise<CreateGameResponse> {
  const res = await fetch("/api/game/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ playerName, rounds }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to create game");
  }

  return res.json();
}

export async function joinGame({
  gameId,
  playerName,
}: JoinGamePayload): Promise<JoinGameResponse> {
  const res = await fetch("/api/game/join", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gameId: gameId.trim().toUpperCase(),
      playerName: playerName.trim(),
    }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error ?? "Failed to join game");
  }

  return res.json();
}

export function playerReady(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/ready`);
}

export function makeMove(gameId: string, move: Move): Promise<void> {
  return postAction(`/api/game/${gameId}/move`, { move });
}

export function nextRound(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/next-round`);
}

export function addAIPlayer({
  gameId,
  difficulty,
  moveHistory,
}: AddAIPayload): Promise<void> {
  return postAction(`/api/game/${gameId}/add-ai`, { difficulty, moveHistory });
}

export function leaveGame(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/leave`);
}

export function kickPlayer(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/kick`);
}

export function requestRematch(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/rematch/request`);
}

export function acceptRematch(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/rematch/accept`);
}

export function denyRematch(gameId: string): Promise<void> {
  return postAction(`/api/game/${gameId}/rematch/deny`);
}
