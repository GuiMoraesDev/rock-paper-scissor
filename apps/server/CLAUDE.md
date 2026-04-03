# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Run with tsx watch (auto-reload) on port 3001
npm run build  # TypeScript compilation to dist/
npm run start  # Run compiled dist/index.js
```

## Architecture

Fastify 5 server with Socket.IO for real-time game state. No database — all state lives in-memory. Organized as a modular architecture with domain-based modules.

### Entry point (`src/index.ts`)

- Creates Fastify with a custom `serverFactory` to share the HTTP server with Socket.IO
- Delegates route registration to `routes/health.routes.ts`
- Delegates socket handler registration to `socket-handlers.ts` (thin composer)

### Shared (`src/shared/`)

Cross-module code used by all handler modules. Modules depend on `shared/`, not on each other.

- **`types.ts`** — Server-internal types: `SocketMeta`, `ServerPlayer`, `Game`, `RoundResult`. Shared client-facing types come from `@rps/shared`.
- **`handler.types.ts`** — `HandlerContext` type (`{ io, socket }`) used by all handler modules.
- **`game.store.ts`** — In-memory state layer wrapping two `Map` instances (`games` and `socketMeta`) behind accessor functions.
- **`game.logic.ts`** — Pure game functions: `generateGameId`, `resolveRound`, `sanitizeGame`, `sanitizeGameFull`.
- **`test-utils.ts`** — Shared test helpers: `createMockSocket`, `createMockIo`, `makeGame`, `makeTwoPlayerGame`.

### Modules (`src/modules/`)

Each module owns a specific domain and exports a `register*Handlers(ctx: HandlerContext)` function.

- **`lobby/`** — Game creation/joining lifecycle and player management (`create-game`, `join-game`, `add-ai-player`, `leave-game`, `kick-player`).
- **`gameplay/`** — Active round logic (`player-ready`, `make-move`, `next-round`). Contains `getAIMoveHistory` helper.
- **`ai/`** — AI prediction strategies and move generation. Pure functions with no Socket.IO dependency (`predictByRecency`, `predictByTransition`, `predictBySequence`, `detectCounterStrategy`, `generateAIMove`).
- **`rematch/`** — Post-game rematch flow (`request-rematch`, `rematch-accepted`, `rematch-denied`). Contains `createRematchGame` helper.
- **`connection/`** — Socket lifecycle (`disconnect`, `request-game-state`).

### Socket handlers (`src/socket-handlers.ts`)

Thin composer that imports and registers all module handlers via `registerSocketHandlers(io, socket)`.

### Routes (`src/routes/`)

- **`health.routes.ts`** — REST endpoints: `GET /health`, `GET /status`, `GET /debug-sentry`.
