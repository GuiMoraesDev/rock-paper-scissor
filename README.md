# Rock Paper Scissors

Real-time multiplayer Rock Paper Scissors game built with Next.js.

## How it works

1. One player creates a game, choosing how many rounds to play (1, 3, or 5)
2. They share the 6-character game code with a friend
3. The friend joins using the code
4. Both players ready up, then pick their moves each round
5. After all rounds, the final scoreboard shows the winner

## Tech stack

- **Framework** — Next.js 15 (App Router), React 18
- **Styling** — Tailwind CSS, Framer Motion
- **Real-time** — SSE (server→client), HTTP POST (client→server)
- **Game logic** — Next.js API routes, in-memory game store

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:3000`.

## Project structure

```
src/
  app/
    api/         → Game API routes + server-side logic
    [gameId]/    → Lobby, game, and results pages
    create/      → Create game page
    join/        → Join game page
  components/    → Shared UI atoms (Button, Input, Modal, Toaster)
  lib/           → Client utilities (token management, types)
  services/      → Client HTTP layer
  schemas/       → Zod validation schemas
```
