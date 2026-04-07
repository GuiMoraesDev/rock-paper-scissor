# Web App

Next.js 15 App Router frontend with Tailwind CSS. Game state flows via SSE (server→client) and HTTP POST (client→server) through Next.js API routes. No external server or state management library.

## Commands

```bash
npm run dev      # Next.js dev server on port 3000
npm run build    # Production build
npm run test     # Run unit tests (Vitest + Testing Library)
npm run test:e2e # Run e2e tests (Playwright)
```

## Game API

`src/lib/game-api.ts` — Client-side API module providing:
- **Token management**: `getPlayerToken()`, `setPlayerToken()`, `clearPlayerToken()` — persists HMAC-signed player tokens in sessionStorage
- **SSE connection**: `connectToGame(gameId, token)` — returns an `EventSource` for real-time game updates
- **Action helpers**: `createGame()`, `joinGame()`, `makeMove()`, `playerReady()`, `nextRound()`, `leaveGame()`, `kickPlayer()`, `addAIPlayer()`, `requestRematch()`, `acceptRematch()`, `denyRematch()` — all POST to `/api/game/...` with `X-Player-Token` header

## API Routes

Game logic lives in `src/app/api/`:
- `api/_lib/` — Server-side infrastructure: game store, game logic, AI strategy, SSE connection management, HMAC auth
- `api/game/create/` and `api/game/join/` — Public routes (no token needed)
- `api/game/[gameId]/events/` — SSE stream (GET, requires token as query param)
- `api/game/[gameId]/{action}/` — Game actions (POST, requires `X-Player-Token` header)

## Components

Organized using **Atomic Design** — see `src/components/CLAUDE.md` for full conventions.

- `atoms/` — Generic reusable primitives (Button, Input, Toast)
- `molecules/` — Composed UI units
- `organisms/` — Full page sections (Lobby, GamePlay, RoundResultScreen, GameFinished)

Each component has its own folder with barrel file and co-located unit test. Interactive elements should have `data-testid` attributes for e2e test targeting.

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

## Testing

- **Unit tests** — Vitest + Testing Library, co-located with components (`*.test.tsx`). Framer Motion is globally mocked in `vitest.setup.ts`.
- **E2E tests** — Playwright in `src/tests/e2e/`. See `src/tests/CLAUDE.md` for conventions. Vitest excludes this directory.
- Use `data-testid` attributes on interactive elements for stable e2e selectors instead of text content or CSS classes.

## Types

Shared types from `@rps/shared`: `Move`, `Player`, `GameState`, `RoundResult`, `SSEEvents`, `AIDifficulty`.
