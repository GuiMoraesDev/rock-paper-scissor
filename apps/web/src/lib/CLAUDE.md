# Lib

Shared utilities and infrastructure for the web app.

## Modules

- **`game-api.ts`** — Client-side API module for game interactions. Provides token management (`getPlayerToken`, `setPlayerToken`, `clearPlayerToken`), SSE connection via `connectToGame()`, and typed POST action helpers (`createGame`, `joinGame`, `makeMove`, `playerReady`, etc.). All game actions use `X-Player-Token` header for authentication.

## Conventions

- Utilities here are app-wide infrastructure, not UI-related. Keep them generic and dependency-light.
- Game communication uses SSE (server→client) and HTTP POST (client→server) via Next.js API routes — no external server.
