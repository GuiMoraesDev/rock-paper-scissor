# Lib

Shared utilities and infrastructure for the web app.

## Modules

- **`game-api.ts`** — Client-side infrastructure for SSE and token management. Provides token helpers (`getPlayerToken`, `setPlayerToken`, `clearPlayerToken`, `getStoredGameId`) that persist HMAC-signed tokens and game IDs in `sessionStorage`, plus `connectToGame(gameId, token)` which returns an `EventSource` for real-time game updates. Does **not** contain HTTP action helpers — those live in `src/services/`.

## Conventions

- Utilities here are app-wide infrastructure, not UI-related. Keep them generic and dependency-light.
- Game communication uses SSE (server→client) and HTTP POST (client→server) via Next.js API routes — no external server.
