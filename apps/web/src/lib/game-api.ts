const TOKEN_STORAGE_KEY = "rps-player-token";
const GAME_ID_STORAGE_KEY = "rps-game-id";

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

export function connectToGame(gameId: string, token: string): EventSource {
  const url = `/api/game/${gameId}/events?token=${encodeURIComponent(token)}`;
  return new EventSource(url);
}
