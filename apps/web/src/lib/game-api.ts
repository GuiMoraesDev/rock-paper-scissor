import type { AIDifficulty, GameState, Move } from "@rps/shared";

const TOKEN_STORAGE_KEY = "rps-player-token";
const GAME_ID_STORAGE_KEY = "rps-game-id";

// --- Token Management ---

export function getPlayerToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setPlayerToken(token: string, gameId: string): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.setItem(GAME_ID_STORAGE_KEY, gameId);
  } catch {
    // sessionStorage unavailable
  }
}

export function clearPlayerToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(GAME_ID_STORAGE_KEY);
  } catch {
    // sessionStorage unavailable
  }
}

export function getStoredGameId(): string | null {
  try {
    return sessionStorage.getItem(GAME_ID_STORAGE_KEY);
  } catch {
    return null;
  }
}

// --- SSE Connection ---

export function connectToGame(gameId: string, token: string): EventSource {
  const url = `/api/game/${gameId}/events?token=${encodeURIComponent(token)}`;
  return new EventSource(url);
}

// --- API Action Helpers ---

type CreateGameResponse = {
  gameId: string;
  playerToken: string;
  game: GameState;
};

type JoinGameResponse = {
  gameId: string;
  playerToken: string;
  game: GameState;
};

type ActionResponse = { success: boolean } | { error: string };

async function postAction(
  url: string,
  body?: Record<string, unknown>,
): Promise<ActionResponse> {
  const token = getPlayerToken();
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { "X-Player-Token": token } : {}),
    },
    body: body ? JSON.stringify(body) : JSON.stringify({}),
  });

  return res.json();
}

export async function createGame(
  playerName: string,
  rounds: number,
): Promise<CreateGameResponse> {
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

export async function joinGame(
  gameId: string,
  playerName: string,
): Promise<JoinGameResponse> {
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

export async function playerReady(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/ready`);
}

export async function makeMove(
  gameId: string,
  move: Move,
): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/move`, { move });
}

export async function nextRound(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/next-round`);
}

export async function addAIPlayer(
  gameId: string,
  difficulty: AIDifficulty,
  moveHistory: Move[],
): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/add-ai`, { difficulty, moveHistory });
}

export async function leaveGame(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/leave`);
}

export async function kickPlayer(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/kick`);
}

export async function requestRematch(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/rematch/request`);
}

export async function acceptRematch(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/rematch/accept`);
}

export async function denyRematch(gameId: string): Promise<ActionResponse> {
  return postAction(`/api/game/${gameId}/rematch/deny`);
}
