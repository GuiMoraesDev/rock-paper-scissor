# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Next.js dev server on port 3000
npm run build  # Production build
npx vitest run # Run unit tests (Vitest + Testing Library)
```

## Architecture

Next.js 15 App Router frontend with Tailwind CSS. All game state comes from Socket.IO — no REST calls, no client-side state management library.

### Socket connection

`lib/socket.ts` — singleton Socket.IO client connecting to `NEXT_PUBLIC_SERVER_URL` (defaults to `http://localhost:3001`). Use `getSocket()` to access the shared instance.

### Pages (App Router)

- `/` — Landing page (create or join)
- `/create` — Enter name, select rounds (1/3/5), emits `create-game`
- `/join` — Enter name + 6-char game code, emits `join-game`
- `/game/[gameId]` — Main game page, renders different components based on `game.status`

### Components

Organized using **Atomic Design** — see `components/CLAUDE.md` for full conventions.

- `atoms/` — Generic reusable primitives (Button, Input, Toast)
- `molecules/` — Composed UI units
- `organisms/` — Full page sections (Lobby, GamePlay, RoundResultScreen, GameFinished)

Each component has its own folder with barrel file and co-located unit test.

### Styling

- Tailwind with custom theme in `tailwind.config.js`: colors (`rps-blue`, `rps-red`, `rps-yellow`), Fredoka font (`font-fun`)
- Custom animations in `tailwind.config.js`: `bounce-in`, `pulse-glow`
- Path alias `@/*` maps to project root

### Types

Shared types from `@rps/shared`: `Move`, `Player`, `GameState`, `RoundResult`.
