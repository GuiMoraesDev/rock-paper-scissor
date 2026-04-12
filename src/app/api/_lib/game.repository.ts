import {
  clearDisconnectTimer,
  deleteGame,
  deletePlayerToken,
  deleteTokensByGame,
  findTokenByGameAndPlayer,
  getGame,
  getPlayerMeta,
  hasGame,
  setDisconnectTimer,
  setGame,
  setPlayerToken,
} from "./game.store";
import type { Game, PlayerMeta } from "./game.types";

// --- Game ---

export const findGame = (gameId: string): Game | undefined => getGame(gameId);

export const saveGame = (gameId: string, game: Game): void =>
  setGame(gameId, game);

export const removeGame = (gameId: string): void => deleteGame(gameId);

export const gameExists = (gameId: string): boolean => hasGame(gameId);

// --- Player tokens ---

export const findPlayerMeta = (token: string): PlayerMeta | undefined =>
  getPlayerMeta(token);

export const savePlayerToken = (token: string, meta: PlayerMeta): void =>
  setPlayerToken(token, meta);

export const removePlayerToken = (token: string): void =>
  deletePlayerToken(token);

export const findTokenByPlayer = (
  gameId: string,
  playerIndex: number,
): string | undefined => findTokenByGameAndPlayer(gameId, playerIndex);

export const removeAllGameTokens = (gameId: string): void =>
  deleteTokensByGame(gameId);

// --- Disconnect timers ---

export const scheduleDisconnectCleanup = (
  token: string,
  timer: NodeJS.Timeout,
): void => setDisconnectTimer(token, timer);

export const cancelDisconnectCleanup = (token: string): void =>
  clearDisconnectTimer(token);
