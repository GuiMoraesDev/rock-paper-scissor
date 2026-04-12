# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server on port 3000
npm run build        # Production build
npm run test         # Run unit tests (Vitest + Testing Library)
npm run test:e2e     # Run e2e tests (Playwright)
npm run lint         # Lint with Biome
npm run lint:fix     # Auto-fix lint issues
npm run check-types  # TypeScript type check
```

## Architecture

Next.js 15 App Router frontend with Tailwind CSS, Framer Motion, SSE for real-time updates, and API routes for game logic. No external server or state management library.

### Real-time game flow

All state synchronization uses **SSE (Server-Sent Events)** for server→client and **HTTP POST** for client→server. Game logic runs in Next.js API route handlers. The server maintains a `Map<gameId, Game>` in memory.

**Game phases:** Home → Create/Join → Lobby (waiting + ready) → Playing → Round Result → (repeat) → Finished

**API routes (client→server):** `POST /api/game/create`, `/api/game/join`, `/api/game/[gameId]/ready`, `/api/game/[gameId]/move`, `/api/game/[gameId]/next-round`, etc.
**SSE events (server→client):** `game-state`, `game-updated`, `round-result`, `game-finished`, `error-msg`, `player-disconnected`, `player-kicked`, `rematch-requested`, `rematch-denied`, `rematch-game-created`
**SSE stream:** `GET /api/game/[gameId]/events?token=<signed>`

### Player Authentication

Players are identified by **HMAC-signed tokens** that bind `gameId + playerIndex + nonce`. Tokens are generated on game creation/join and sent as `X-Player-Token` header (POST) or query param (SSE). Each API route validates the token signature, game membership, and player role (`OWNER` = creator, `GUEST` = joiner).

### Animations

- Use **Framer Motion** (`motion.*` components, `AnimatePresence`) for component transitions and interactive animations (hover, tap, entrance/exit).
- Use **Tailwind CSS animations** for simple, declarative effects (`animate-float`, `animate-bounce-in`, `animate-pulse`, etc.).
- Framer Motion is globally mocked in `vitest.setup.ts` — unit tests render motion components as plain DOM elements. No special test setup needed per component.

### Testing

- **Unit tests** — Vitest + Testing Library, co-located with components. Run with `npm run test`.
- **E2E tests** — Playwright in `src/tests/e2e/`. Run with `npm run test:e2e`. See `src/tests/CLAUDE.md` for conventions.
- Use `data-testid` attributes on interactive elements for stable e2e selectors. Vitest excludes the `src/tests/e2e/` directory.

### TypeScript conventions

- Prefer `type` over `interface` for all type definitions.
- Import types directly (e.g., `type ReactNode`, `type ComponentProps`).
- Always use named exports (`export const`). Never use `export default`.
- All functions must be **arrow functions**: `export const foo = async (...) => { ... }`.
- All function parameters must use a **single destructured object** — no positional arguments.
- **No inline types** on function signatures — always declare a named `type` for params and non-primitive returns.
- Each type must be declared **immediately before its first usage**, not grouped at the top of the file.
- All function names must start with a **verb** (e.g. `createGame`, `markPlayerReady`, `startNextRound`).
- Never export anything that is not used outside the file.

## Client-side API

`src/lib/game-api.ts` — Token management and AI move history:

- **Token management**: `getPlayerToken()`, `setPlayerToken()`, `clearPlayerToken()`, `getStoredGameId()` — persists HMAC-signed tokens and game ID in `sessionStorage`
- **AI move history**: `getAIMoveHistory()` — reads the stored AI opponent move list from `sessionStorage`
- SSE connection logic lives in `[gameId]/_src/providers/GameSSEProvider.tsx`

`src/services/` — HTTP action helpers (one file per domain). Components never call `fetch` or axios directly.

- `lobby.api.ts` — `createGame`, `joinGame`, `markPlayerReady`, `addAIPlayer`, `kickPlayer`
- `game.api.ts` — `makeMove`, `startNextRound`, `leaveGame`, `requestRematch`, `acceptRematch`, `denyRematch`

`src/providers/QueryProvider.tsx` — Wraps the app with `QueryClientProvider` from TanStack React Query (mutations retry disabled by default).

## API Routes

Game logic lives in `src/app/api/`:

- `api/_lib/` — Server-side infrastructure: game store, game logic, AI strategy, SSE connection management, HMAC auth
- `api/game/create/` and `api/game/join/` — Public routes (no token needed)
- `api/game/[gameId]/events/` — SSE stream (GET, requires token as query param)
- `api/game/[gameId]/{action}/` — Game actions (POST, requires `X-Player-Token` header)

## Components

Organized using **Atomic Design** — see `src/components/CLAUDE.md` for full conventions.

- `atoms/` — Generic reusable primitives (Button, Input, Toast, Toaster, Modal)

Page-specific components (Lobby, GamePlay, RoundResultScreen, GameFinished) live inside each page's `_src/` directory, not in the shared `src/components/` tree. Each component has its own folder with barrel file and co-located unit test. Interactive elements should have `data-testid` attributes for e2e test targeting.

## Styling

- Tailwind with custom theme in `tailwind.config.js`: colors (`rps-blue`, `rps-red`, `rps-yellow`), Fredoka font (`font-fun`)
- Custom animations in `tailwind.config.js`: `bounce-in`, `pulse-glow`, `slide-in-left`
- Path alias `@/*` maps to `src/`
- Use `clsx` for composing Tailwind classes. Prefer arrays of strings for readability over template literals:
  ```ts
  className={clsx(
    "font-fun text-2xl",
    "px-8 py-5 rounded-2xl",
    condition && "animate-pulse",
    className,
  )}
  ```
- Use `tailwind-variants` (`tv`) for component variants. Export the variants function so styles can be reused independently:

  ```ts
  import { tv, type VariantProps } from "tailwind-variants";

  const buttonVariants = tv({
    base: ["font-fun", "cursor-pointer"],
    variants: {
      variant: { blue: "bg-rps-blue", ghost: "bg-transparent" },
      size: { md: "text-2xl px-8 py-5", sm: "text-xl px-4 py-2" },
    },
    defaultVariants: { variant: "blue", size: "md" },
  });

  type Props = ComponentProps<"button"> & VariantProps<typeof buttonVariants>;
  ```

## HTML & layout conventions

- Use semantic HTML tags (`section`, `header`, `footer`, `nav`, `article`) over generic `div` wrappers. Choose the tag that best describes the content's role.
- Use Fragments (`<>...</>`) instead of wrapping elements when no extra DOM node is needed.
- Prefer `gap` (via `flex`/`grid` parent) over margin utilities (`mb-*`, `mt-*`) for spacing between sibling elements.

## Props conventions

For React component props, use `ComponentProps<"element">` from React and extend it:

```ts
import { type ComponentProps } from "react";

type Props = ComponentProps<"button"> & {
  variant?: "blue" | "red";
};
```

## Providers conventions

When exposing state through context, wrap state transitions in **named functions** (verb-based, e.g. `markRematchSent`) instead of exposing raw setter functions. Named functions communicate intent and prevent callers from setting arbitrary values.

## Types

Game types live in `src/lib/types.ts`: `Move`, `Player`, `GameState`, `RoundResult`, `SSEEvents`, `AIDifficulty`.
