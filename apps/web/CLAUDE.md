# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev    # Next.js dev server on port 3000
npm run build  # Production build
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

All in `components/`, each corresponds to a game phase rendered by `/game/[gameId]`:

- `Lobby` — Shows game code, waits for both players to ready up
- `GamePlay` — Move selection (rock/paper/scissors)
- `RoundResultScreen` — Shows both moves and round winner
- `GameFinished` — Final scores and round history

### Styling

- Tailwind with custom theme in `tailwind.config.js`: colors (`rps-blue`, `rps-red`, `rps-yellow`), Fredoka font (`font-fun`)
- Custom animations in `globals.css`: `bounce-in`, `pulse-glow`, `shake`, `float`
- Path alias `@/*` maps to project root

### Types

Shared types from `@rps/shared`: `Move`, `Player`, `GameState`, `RoundResult`.
