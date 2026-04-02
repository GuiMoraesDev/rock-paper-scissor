# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Run with tsx watch (auto-reload) on port 3001
npm run build  # TypeScript compilation to dist/
npm run start  # Run compiled dist/index.js
```

## Architecture

Fastify 5 server with Socket.IO for real-time game state. No database — all state lives in-memory via `game-store.ts`.

### Entry point (`src/index.ts`)

- Creates Fastify with a custom `serverFactory` to share the HTTP server with Socket.IO
- Single REST endpoint: `GET /health`

### Types (`src/types.ts`)

Server-internal types: `SocketMeta`, `ServerPlayer`, `Game`, `RoundResult`. Shared client-facing types come from `@rps/shared`.

### Game logic (`src/game-logic.ts`)

Pure functions with no side effects or Socket.IO dependency:

- `generateGameId()` — 6-char alphanumeric code (excludes ambiguous chars like O/0/1/I)
- `resolveRound(move1, move2)` — determines round winner
- `generateAIMove(difficulty, moveHistory)` — AI move generation based on difficulty and player's move history (easy=random, normal=current game patterns, hard=all session history)
- `sanitizeGame(game)` — strips moves from player data (hides choices during play)
- `sanitizeGameFull(game)` — includes moves (used for round-result and finished states)

### Game store (`src/game-store.ts`)

In-memory state layer wrapping two `Map` instances (`games` and `socketMeta`) behind accessor functions: `getGame`, `setGame`, `deleteGame`, `hasGame`, `getSocketMeta`, `setSocketMeta`, `deleteSocketMeta`.

### Socket handlers (`src/socket-handlers.ts`)

`registerSocketHandlers(io, socket)` — registers all Socket.IO event handlers for a connected client. Delegates to `game-store` and `game-logic`.

**Socket events handled:**
| Event | Description |
|---|---|
| `create-game` | Creates game, joins room, emits `game-created` |
| `join-game` | Validates + adds player 2, emits `game-updated` + `joined-game` |
| `add-ai-player` | Creator adds AI bot to lobby with chosen difficulty, emits `game-updated` |
| `player-ready` | Marks player ready; when both ready, transitions to `playing` |
| `make-move` | Records move; when both moved, resolves round via `resolveRound` |
| `next-round` | Resets moves, increments round, transitions back to `playing` |
| `request-game-state` | Returns current state (for page refresh reconnection) |
| `disconnect` | Notifies opponent; cleans up game after 30s if room empty |
