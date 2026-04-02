import type { Game, SocketMeta } from "./types.js";

const games = new Map<string, Game>();
const socketMeta = new Map<string, SocketMeta>();

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

export function getSocketMeta(socketId: string): SocketMeta | undefined {
  return socketMeta.get(socketId);
}

export function setSocketMeta(socketId: string, meta: SocketMeta): void {
  socketMeta.set(socketId, meta);
}

export function deleteSocketMeta(socketId: string): void {
  socketMeta.delete(socketId);
}

export function getGameCount(): number {
  return games.size;
}

export function getActiveConnectionCount(): number {
  return socketMeta.size;
}

export function resetStore(): void {
  games.clear();
  socketMeta.clear();
}
