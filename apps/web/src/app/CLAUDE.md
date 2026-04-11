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
- SSE is managed by phase-specific providers (`LobbyProvider`, `GameProvider`, `ResultsProvider`) under `[gameId]/*/`_src/provider/`. Each opens an `EventSource` in `useEffect`, manages phase state, and exposes a typed hook (`useLobby`, `useGame`, `useResults`). When the server signals that the game doesn't exist, the provider calls `setGameNotFound` from `useGameNotFound()` — the layout intercepts and renders the error screen.
- "Game not found" is centralized in `[gameId]/layout.tsx` via `GameNotFoundContext`. Individual providers call `setGameNotFound(true)`; the layout renders the error UI instead of children.
- Pages compose atoms from `@/components/` alongside page-specific `_src/` components.
- Navigation uses `useRouter().push()` after receiving API responses or SSE events (inside client components).
