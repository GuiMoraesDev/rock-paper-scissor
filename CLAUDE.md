# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (Next.js only, via Turborepo)
npm run dev

# Build all apps
npm run build

# Run all unit tests
npm run test

# Run e2e tests (Playwright, web only)
npm run test:e2e --filter=@rps/web

# Run the app
npm run dev -- --filter=@rps/web    # Next.js on port 3000
```

## Architecture

Turborepo monorepo with two workspaces:

- **`apps/web`** — Next.js 15 frontend (App Router) with Tailwind CSS, Framer Motion, SSE for real-time updates, and API routes for game logic
- **`packages/shared`** — Shared TypeScript types (`Move`, `Player`, `GameState`, `RoundResult`, `SSEEvents`) imported as `@rps/shared`

### Real-time game flow

All state synchronization uses **SSE (Server-Sent Events)** for server→client and **HTTP POST** for client→server. Game logic runs in Next.js API route handlers. The server maintains a `Map<gameId, Game>` in memory.

**Game phases:** Home → Create/Join → Lobby (waiting + ready) → Playing → Round Result → (repeat) → Finished

**API routes (client→server):** `POST /api/game/create`, `/api/game/join`, `/api/game/[gameId]/ready`, `/api/game/[gameId]/move`, `/api/game/[gameId]/next-round`, etc.
**SSE events (server→client):** `game-state`, `game-updated`, `round-result`, `game-finished`, `error-msg`, `player-disconnected`, `player-kicked`, `rematch-requested`, `rematch-denied`, `rematch-game-created`
**SSE stream:** `GET /api/game/[gameId]/events?token=<signed>`

### Player Authentication

Players are identified by **HMAC-signed tokens** that bind `gameId + playerIndex + nonce`. Tokens are generated on game creation/join and sent as `X-Player-Token` header (POST) or query param (SSE). Each API route validates the token signature, game membership, and player role (`OWNER` = creator, `GUEST` = joiner).

### Animations (web)

- Use **Framer Motion** (`motion.*` components, `AnimatePresence`) for component transitions and interactive animations (hover, tap, entrance/exit).
- Use **Tailwind CSS animations** for simple, declarative effects (`animate-float`, `animate-bounce-in`, `animate-pulse`, etc.).
- Framer Motion is globally mocked in `vitest.setup.ts` — unit tests render motion components as plain DOM elements. No special test setup needed per component.

### Testing

- **Unit tests** — Vitest + Testing Library, co-located with components. Run with `npm run test`.
- **E2E tests** — Playwright in `apps/web/src/tests/e2e/`. Run with `npm run test:e2e` from `apps/web`. See `src/tests/CLAUDE.md` for conventions.
- Use `data-testid` attributes on interactive elements for stable e2e selectors. Vitest excludes the `src/tests/e2e/` directory.

### TypeScript conventions (all workspaces)

- Prefer `type` over `interface` for all type definitions.
- Import types directly (e.g., `type ReactNode`, `type ComponentProps`).
- Always use named exports (`export const`). Never use `export default`.
- All functions must be **arrow functions**: `export const foo = async (...) => { ... }`.
- All function parameters must use a **single destructured object** — no positional arguments.
- **No inline types** on function signatures — always declare a named `type` for params and non-primitive returns.
- Each type must be declared **immediately before its first usage**, not grouped at the top of the file.
- All function names must start with a **verb** (e.g. `createGame`, `markPlayerReady`, `startNextRound`).
- Never export anything that is not used outside the file.
