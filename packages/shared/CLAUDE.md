# Shared Types

Shared TypeScript types consumed by `apps/web` (both client and API routes). Imported as `@rps/shared`.

## Commands

```bash
npm run build  # TypeScript compilation to dist/
```

## Exports

All types are exported from `src/index.ts`:

- `SSEEvents` — Constants for SSE event names (server→client)
- `Move` — `"rock" | "paper" | "scissors"`
- `AIDifficulty` — `"easy" | "normal" | "hard"`
- `Player` — player name, ready state, score, move
- `RoundResult` — round number, both moves, winner
- `GameState` — full game state (id, rounds, status, players, results)

## Conventions

- Prefer `type` over `interface` (aligns with repo-wide convention).
- Any type needed by both client and server API routes belongs here. Types used only by one side stay local.
