# Services

Client-side HTTP layer. All API calls go through here — components never call `fetch` or axios directly.

## Structure

- **`api.ts`** — axios instance shared by all modules. Request interceptor injects `X-Player-Token` from `sessionStorage`. Response interceptor normalizes errors by extracting the `error` field from the response body.
- **`[module].api.ts`** — one file per domain. Each file exports typed async arrow functions and their payload/response types.

## Modules

- **`lobby.api.ts`** — lobby actions: `createGame`, `joinGame`, `markPlayerReady`, `addAIPlayer`, `kickPlayer`, `leaveGame`
- **`game.api.ts`** — in-game actions: `makeMove`, `startNextRound`
- **`results.api.ts`** — post-game actions: `requestRematch`, `acceptRematch`, `denyRematch`

## Conventions

- Import `api` from `./api` — never instantiate axios directly.
- Payload and response types live in the same file as the function that uses them, declared immediately before first usage.
- `createGame` and `joinGame` do not need a token — the interceptor is a no-op when no token is stored.
