# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development (runs both web and server concurrently via Turborepo)
npm run dev

# Build all apps
npm run build

# Run all unit tests
npm run test

# Run e2e tests (Playwright, web only)
npm run test:e2e --filter=@rps/web

# Run individual apps
npm run dev -- --filter=@rps/web    # Next.js on port 3000
npm run dev -- --filter=@rps/server # Fastify on port 3001 (tsx watch)
```

## Architecture

Turborepo monorepo with three workspaces:

- **`apps/web`** — Next.js 15 frontend (App Router) with Tailwind CSS, Framer Motion, and Socket.IO client
- **`apps/server`** — Fastify backend with Socket.IO server, holds all game logic in-memory
- **`packages/shared`** — Shared TypeScript types (`Move`, `Player`, `GameState`, `RoundResult`) imported as `@rps/shared`

### Real-time game flow

All state synchronization happens through Socket.IO events — no REST API, no external database. The server maintains a `Map<gameId, Game>` in memory.

**Game phases:** Home → Create/Join → Lobby (waiting + ready) → Playing → Round Result → (repeat) → Finished

**Key server events:** `create-game`, `join-game`, `add-ai-player`, `player-ready`, `make-move`, `next-round`, `request-game-state`
**Key client events:** `game-updated`, `round-result`, `game-finished`, `error-msg`, `player-disconnected`

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
- Always use named exports (`export function`, `export const`). Never use `export default`.
