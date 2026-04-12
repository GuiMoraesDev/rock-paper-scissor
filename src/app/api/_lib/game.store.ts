import type { Game, PlayerMeta } from "./game.types";

const games = new Map<string, Game>();
const playerTokens = new Map<string, PlayerMeta>();
const disconnectTimers = new Map<string, NodeJS.Timeout>();

// --- Game operations ---

export function getGame(gameId: string): Game | undefined {
  return games.get(gameId);
}

export function setGame(gameId: string, game: Game): void {
  games.set(gameId, game);
}

export function deleteGame(gameId: string): void {
  games.delete(gameId);
}

export function hasGame(gameId: string): boolean {
  return games.has(gameId);
}

// --- Player token operations ---

export function getPlayerMeta(token: string): PlayerMeta | undefined {
  return playerTokens.get(token);
}

export function setPlayerToken(token: string, meta: PlayerMeta): void {
  playerTokens.set(token, meta);
}

export function deletePlayerToken(token: string): void {
  playerTokens.delete(token);
}

export function findTokenByGameAndPlayer(
  gameId: string,
  playerIndex: number,
): string | undefined {
  let found: string | undefined;
  playerTokens.forEach((meta, token) => {
    if (meta.gameId === gameId && meta.playerIndex === playerIndex) {
      found = token;
    }
  });
  return found;
}

export function deleteTokensByGame(gameId: string): void {
  const tokensToDelete: string[] = [];
  playerTokens.forEach((meta, token) => {
    if (meta.gameId === gameId) {
      tokensToDelete.push(token);
    }
  });
  tokensToDelete.forEach((token) => {
    playerTokens.delete(token);
  });
}

// --- Disconnect timer operations ---

export function setDisconnectTimer(token: string, timer: NodeJS.Timeout): void {
  disconnectTimers.set(token, timer);
}

export function clearDisconnectTimer(token: string): void {
  const timer = disconnectTimers.get(token);
  if (timer) {
    clearTimeout(timer);
    disconnectTimers.delete(token);
  }
}

export function getDisconnectTimer(token: string): NodeJS.Timeout | undefined {
  return disconnectTimers.get(token);
}

// --- Utilities ---

export function getGameCount(): number {
  return games.size;
}

export function getActiveConnectionCount(): number {
  return playerTokens.size;
}

export function resetStore(): void {
  games.clear();
  playerTokens.clear();
  disconnectTimers.forEach((timer) => {
    clearTimeout(timer);
  });
  disconnectTimers.clear();
}
