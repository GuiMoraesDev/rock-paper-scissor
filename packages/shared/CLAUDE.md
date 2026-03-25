# Shared Types

Shared TypeScript types consumed by both `apps/web` and `apps/server`. Imported as `@rps/shared`.

## Commands

```bash
npm run build  # TypeScript compilation to dist/
```

## Exports

All types are exported from `src/index.ts`:

- `Move` — `"rock" | "paper" | "scissors"`
- `Player` — player name, ready state, score, move
- `RoundResult` — round number, both moves, winner
- `GameState` — full game state (id, rounds, status, players, results)

## Conventions

- This package is types-only — no runtime code.
- Prefer `type` over `interface` (aligns with repo-wide convention).
- Any type needed by both web and server belongs here. Types used only by one workspace stay local.
