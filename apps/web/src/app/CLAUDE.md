# App (Pages)

Next.js 15 App Router pages. Pages are **server components by default** — only interactive parts live in client components inside `_src/`.

## Routes

- `/` (`page.tsx`) — Landing page with Create/Join buttons
- `/create` (`create/page.tsx`) — Enter name, select rounds (1/3/5), emits `create-game`
- `/join` (`join/page.tsx`) — Enter name + 6-char game code, emits `join-game`
- `/game/[gameId]` (`game/[gameId]/page.tsx`) — Main game page, renders different components based on `game.status`

## Server-first principle

- `page.tsx` files must be **server components** (no `"use client"`). They handle layout, metadata, and static content.
- Only code that requires client interaction (hooks, event listeners, browser APIs, state) goes into `"use client"` components inside the `_src/` folder.
- The page imports and composes these client components, keeping the boundary as narrow as possible.

## Page-scoped code (`_src/`)

Each page can have a `_src/` directory for page-specific client components, hooks, and utilities (e.g., `create/_src/components/CreateForm.tsx`). This keeps interactive code co-located with its page without polluting shared components.

## Conventions

- Keep `page.tsx` thin and server-side — delegate interactivity to `_src/` client components.
- Client components in `_src/` set up socket listeners in `useEffect` and clean up on unmount.
- Pages compose atoms and organisms from `@/components/` alongside page-specific `_src/` components.
- Navigation uses `useRouter().push()` after receiving socket confirmation events (inside client components).
