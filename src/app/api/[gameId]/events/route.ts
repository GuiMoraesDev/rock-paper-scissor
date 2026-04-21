import { authenticateSSE } from "../../_lib/auth";
import { sanitizeGame, sanitizeGameFull } from "../../_lib/game.logic";
import {
  cancelDisconnectCleanup,
  findGame,
  findPlayerMeta,
  removeGame,
  scheduleDisconnectCleanup,
} from "../../_lib/game.repository";
import {
  addConnection,
  broadcastToGame,
  getGameConnectionCount,
  removeConnection,
} from "../../_lib/sse-connections";

export const dynamic = "force-dynamic";

const HEARTBEAT_INTERVAL_MS = 15_000;
const DISCONNECT_TIMEOUT_MS = 30_000;

type RouteContext = { params: Promise<{ gameId: string }> };

export const GET = async (request: Request, context: RouteContext) => {
  const { gameId } = await context.params;

  const auth = authenticateSSE(request, gameId);
  if (!auth.success) return auth.response;

  const { meta, token } = auth;

  // Cancel any pending disconnect timer for this player
  cancelDisconnectCleanup(token);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addConnection(gameId, token, controller);

      // Send initial game state
      const game = findGame(gameId);
      if (game) {
        const sanitized =
          game.status === "round-result" || game.status === "finished"
            ? sanitizeGameFull({ game })
            : sanitizeGame({ game });

        const message = `event: game-state\ndata: ${JSON.stringify({
          game: sanitized,
          playerIndex: meta.playerIndex,
        })}\n\n`;
        controller.enqueue(encoder.encode(message));
      }

      // Heartbeat to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          clearInterval(heartbeat);
        }
      }, HEARTBEAT_INTERVAL_MS);

      // Handle client disconnect via AbortSignal
      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        removeConnection(gameId, token);

        const disconnectedGame = findGame(gameId);
        // Only broadcast if the player token still exists — if it was already
        // deleted (intentional leave via the leave API), skip the broadcast to
        // avoid overriding the game-updated event the owner already received.
        if (disconnectedGame && findPlayerMeta(token)) {
          const playerName =
            disconnectedGame.players[meta.playerIndex]?.name ??
            "Unknown player";

          broadcastToGame(gameId, "player-disconnected", { playerName });

          // Schedule cleanup after timeout
          const timer = setTimeout(() => {
            if (getGameConnectionCount(gameId) === 0) {
              removeGame(gameId);
              console.log(`Game ${gameId} cleaned up after disconnect timeout`);
            }
          }, DISCONNECT_TIMEOUT_MS);

          scheduleDisconnectCleanup(token, timer);
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
