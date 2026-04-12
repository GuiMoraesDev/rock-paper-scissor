import { authenticateSSE } from "../../../_lib/auth";
import { sanitizeGame, sanitizeGameFull } from "../../../_lib/game.logic";
import {
  clearDisconnectTimer,
  deleteGame,
  getGame,
  setDisconnectTimer,
} from "../../../_lib/game.store";
import {
  addConnection,
  broadcastToGame,
  getGameConnectionCount,
  removeConnection,
} from "../../../_lib/sse-connections";

export const dynamic = "force-dynamic";

const HEARTBEAT_INTERVAL_MS = 15_000;
const DISCONNECT_TIMEOUT_MS = 30_000;

type RouteContext = { params: Promise<{ gameId: string }> };

export async function GET(request: Request, context: RouteContext) {
  const { gameId } = await context.params;

  const auth = authenticateSSE(request, gameId);
  if (!auth.success) return auth.response;

  const { meta, token } = auth;

  // Cancel any pending disconnect timer for this player
  clearDisconnectTimer(token);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      addConnection(gameId, token, controller);

      // Send initial game state
      const game = getGame(gameId);
      if (game) {
        const sanitized =
          game.status === "round-result" || game.status === "finished"
            ? sanitizeGameFull(game)
            : sanitizeGame(game);

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

        const game = getGame(gameId);
        if (game) {
          const playerName =
            game.players[meta.playerIndex]?.name ?? "Unknown player";

          broadcastToGame(gameId, "player-disconnected", { playerName });

          // Schedule cleanup after timeout
          const timer = setTimeout(() => {
            if (getGameConnectionCount(gameId) === 0) {
              deleteGame(gameId);
              console.log(`Game ${gameId} cleaned up after disconnect timeout`);
            }
          }, DISCONNECT_TIMEOUT_MS);

          setDisconnectTimer(token, timer);
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
}
