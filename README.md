# Rock Paper Scissors

Real-time multiplayer Rock Paper Scissors game built with Next.js and Fastify.

## How it works

1. One player creates a game, choosing how many rounds to play (1, 3, or 5)
2. They share the 6-character game code with a friend
3. The friend joins using the code
4. Both players ready up, then pick their moves each round
5. After all rounds, the final scoreboard shows the winner

## Tech stack

- **Frontend** — Next.js 15 (App Router), React 18, Tailwind CSS, Socket.IO client
- **Backend** — Fastify 5, Socket.IO server
- **Shared** — TypeScript types package (`@rps/shared`)
- **Monorepo** — Turborepo with npm workspaces

## Getting started

```bash
npm install
npm run dev
```

This starts both the web app (`http://localhost:3000`) and the server (`http://localhost:3001`).

## Environment variables

| Variable | App | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_SERVER_URL` | web | `http://localhost:3001` | Socket.IO server URL |
| `CLIENT_URL` | server | `http://localhost:3000` | Allowed CORS origin |
| `PORT` | server | `3001` | Server port |

## Project structure

```
apps/
  web/       → Next.js frontend
  server/    → Fastify + Socket.IO backend
packages/
  shared/    → Shared TypeScript types
```
