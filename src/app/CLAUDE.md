# App (Pages)

Next.js 15 App Router pages. Pages are **server components by default** — only interactive parts live in client components inside `_src/`.

## Routes

- `/` (`page.tsx`) — Landing page with Create/Join buttons
- `/create` (`create/page.tsx`) — Enter name, select rounds (1/3/5), POSTs to `/api/game/create`
- `/join` (`join/page.tsx`) — Enter name + 6-char game code, POSTs to `/api/game/join`
- `/[gameId]/layout.tsx` — Shared layout for all game phases. Provides `GameNotFoundContext` and renders the "Game not found" screen when any provider signals it. Also wraps children in the shared `<main>` layout.
- `/[gameId]/lobby` (`[gameId]/lobby/page.tsx`) — Waiting room. Players ready up; owner can add AI or kick.
- `/[gameId]/game` (`[gameId]/game/page.tsx`) — Active gameplay: move selection and round result screen.
- `/[gameId]/results` (`[gameId]/results/page.tsx`) — Final scoreboard with rematch options.
- `/status` (`(status)/status/page.tsx`) — Internal status dashboard (`StatusDashboard` component), grouped under the `(status)` route group (no layout impact).

## Server-first principle

- `page.tsx` files must be **server components** (no `"use client"`). They handle layout, metadata, and static content.
- Only code that requires client interaction (hooks, event listeners, browser APIs, state) goes into `"use client"` components inside the `_src/` folder.
- The page imports and composes these client components, keeping the boundary as narrow as possible.

## Page-scoped code (`_src/`)

Each page can have a `_src/` directory for page-specific client components, hooks, and utilities (e.g., `create/_src/components/CreateForm.tsx`). This keeps interactive code co-located with its page without polluting shared components.

Client components that grow in complexity should extract hooks into a `hooks/` subdirectory co-located with the component. Follow these naming conventions:

- `use<Entity>Mutation` — wraps a TanStack `useMutation` call, including side effects (token storage, navigation, error toasts). Example: `useCreateGameMutation`.
- `use<Form>Validation` — wraps `useForm` with a Zod resolver for that form's schema. Example: `useCreateGameValidation`.

## Conventions

- Keep `page.tsx` thin and server-side — delegate interactivity to `_src/` client components.
- SSE is managed by a single shared `GameSSEProvider` at `[gameId]/_src/providers/GameSSEProvider.tsx`, mounted in `[gameId]/layout.tsx`. It maintains ONE persistent `EventSource` for the entire game session (across all phase transitions), handles all routing between phases using `usePathname()` to avoid re-pushing the current route, and exposes shared state via `useGameSSE()`: `game`, `playerIndex`, `error`, `lastRoundResult`, `rematchState`, `rematchRequesterName`, `markRematchSent`, `markRematchCancelled`.
- Each game phase page (`lobby`, `game`, `results`) delegates entirely to a `*View` component (e.g. `LobbyView`, `GameView`, `ResultsView`) inside `_src/views/`. The View is a `"use client"` component that calls `useGameSSE()` directly and composes page-specific sub-components from its own `_src/components/` directory. There are no phase-level providers.
- "Game not found" is centralized in `[gameId]/layout.tsx` via `GameNotFoundProvider`. `GameSSEProvider` calls `setGameNotFound(true)` on a 404 response; the layout renders the error UI instead of children.
- Pages compose atoms from `@/components/` alongside page-specific `_src/` components.
- Navigation uses `useRouter().push()` after receiving API responses or SSE events (inside client components).
