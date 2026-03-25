# Lib

Shared utilities and infrastructure for the web app.

## Modules

- **`socket.ts`** — Singleton Socket.IO client. Provides `getSocket()` (lazy-initializes and returns the shared socket instance) and `disconnectSocket()` (disconnects and clears the instance). Connects to `NEXT_PUBLIC_SERVER_URL` (defaults to `http://localhost:3001`).

## Conventions

- Utilities here are app-wide infrastructure, not UI-related. Keep them generic and dependency-light.
- Socket.IO is the only external connection layer — no REST clients or state management libraries.
