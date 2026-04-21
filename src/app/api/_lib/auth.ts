import crypto from "node:crypto";
import { getGame, getPlayerMeta } from "./game.store";
import type { PlayerMeta, PlayerRole } from "./game.types";

const SERVER_SECRET = crypto.randomBytes(32);

type TokenPayload = {
  gameId: string;
  playerIndex: number;
  nonce: string;
};

function encodePayload(payload: TokenPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(encoded: string): TokenPayload | null {
  try {
    const json = Buffer.from(encoded, "base64url").toString("utf-8");
    return JSON.parse(json) as TokenPayload;
  } catch {
    return null;
  }
}

function sign(data: string): string {
  return crypto
    .createHmac("sha256", SERVER_SECRET)
    .update(data)
    .digest("base64url");
}

export function createPlayerToken(gameId: string, playerIndex: number): string {
  const payload: TokenPayload = {
    gameId,
    playerIndex,
    nonce: crypto.randomUUID(),
  };
  const encoded = encodePayload(payload);
  const signature = sign(encoded);
  return `${encoded}.${signature}`;
}

export function verifyToken(
  token: string,
): { payload: TokenPayload; meta: PlayerMeta } | null {
  const dotIndex = token.indexOf(".");
  if (dotIndex === -1) return null;

  const encoded = token.substring(0, dotIndex);
  const signature = token.substring(dotIndex + 1);

  // Verify HMAC signature — prevents forgery
  const expectedSignature = sign(encoded);
  if (
    !crypto.timingSafeEqual(
      Buffer.from(signature, "base64url"),
      Buffer.from(expectedSignature, "base64url"),
    )
  ) {
    return null;
  }

  const payload = decodePayload(encoded);
  if (!payload) return null;

  // Verify token is still registered (revocable)
  const meta = getPlayerMeta(token);
  if (!meta) return null;

  // Verify payload matches stored meta
  if (
    meta.gameId !== payload.gameId ||
    meta.playerIndex !== payload.playerIndex
  ) {
    return null;
  }

  return { payload, meta };
}

type AuthResult =
  | { success: true; meta: PlayerMeta; token: string }
  | { success: false; response: Response };

export function authenticatePlayer(
  request: Request,
  routeGameId: string,
  allowedRoles: PlayerRole[],
): AuthResult {
  const token = request.headers.get("X-Player-Token");
  if (!token) {
    return {
      success: false,
      response: Response.json(
        { error: "Missing player token" },
        { status: 401 },
      ),
    };
  }

  const verified = verifyToken(token);
  if (!verified) {
    return {
      success: false,
      response: Response.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }

  const { meta } = verified;

  // Verify token's gameId matches the route param
  if (meta.gameId !== routeGameId) {
    return {
      success: false,
      response: Response.json(
        { error: "Token does not match this game" },
        { status: 403 },
      ),
    };
  }

  // Verify game still exists
  if (!getGame(routeGameId)) {
    return {
      success: false,
      response: Response.json({ error: "Game not found" }, { status: 404 }),
    };
  }

  // Verify role authorization
  if (!allowedRoles.includes(meta.role)) {
    return {
      success: false,
      response: Response.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      ),
    };
  }

  return { success: true, meta, token };
}

export function authenticateSSE(
  request: Request,
  routeGameId: string,
): AuthResult {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!token) {
    return {
      success: false,
      response: Response.json(
        { error: "Missing player token" },
        { status: 401 },
      ),
    };
  }

  const verified = verifyToken(token);
  if (!verified) {
    return {
      success: false,
      response: Response.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }

  const { meta } = verified;

  if (meta.gameId !== routeGameId) {
    return {
      success: false,
      response: Response.json(
        { error: "Token does not match this game" },
        { status: 403 },
      ),
    };
  }

  if (!getGame(routeGameId)) {
    return {
      success: false,
      response: Response.json({ error: "Game not found" }, { status: 404 }),
    };
  }

  return { success: true, meta, token };
}
