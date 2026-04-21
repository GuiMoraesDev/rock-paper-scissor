# API `_lib/` — Shared Infrastructure

This directory contains all server-side infrastructure for the API routes. Route files (`route.ts`) are thin HTTP handlers; domain logic lives here.

## File Responsibilities

| File | Owns |
|---|---|
| `game.types.ts` | Type definitions only (`PlayerRole`, `Game`, `ServerPlayer`, etc.) |
| `game.logic.ts` | Pure domain logic: constants, game rules, state sanitization, and any operation shared by 2+ routes |
| `game.store.ts` | In-memory state access (`Map`-backed store for games, tokens, disconnect timers) |
| `auth.ts` | HMAC token lifecycle: `createPlayerToken`, `verifyToken`, `authenticatePlayer`, `authenticateSSE` |
| `ai-strategy.ts` | AI move generation and prediction algorithms |
| `sse-connections.ts` | SSE broadcast infrastructure: `broadcastToGame`, `sendToPlayer`, `moveConnectionsToGame` |

## Rules

- **Shared logic belongs in `game.logic.ts`**: If the same function or constant is needed by 2 or more routes, extract it here — never duplicate it across routes.
- **`game.types.ts` is types only**: No runtime code.
- **`game.store.ts` is storage only**: No game rules or business logic.

## Conventions

All functions follow the project TypeScript conventions:
- Arrow functions: `export const foo = (...) => { ... }`
- Single destructured object for parameters: `export const foo = ({ bar, baz }: FooParams) => ...`
- Named type declared immediately before its first usage

**Framework exception**: Next.js route handlers must use positional parameters `(request: Request, context: RouteContext)` — this is required by the framework and is the only valid exception to the single-destructured-object rule.
