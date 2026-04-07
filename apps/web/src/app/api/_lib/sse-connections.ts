type SSEController = ReadableStreamDefaultController;

type GameConnections = Map<string, SSEController>;

const connections = new Map<string, GameConnections>();

function formatSSEMessage(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function addConnection(
  gameId: string,
  token: string,
  controller: SSEController,
): void {
  let gameConns = connections.get(gameId);
  if (!gameConns) {
    gameConns = new Map();
    connections.set(gameId, gameConns);
  }
  gameConns.set(token, controller);
}

export function removeConnection(gameId: string, token: string): void {
  const gameConns = connections.get(gameId);
  if (!gameConns) return;
  gameConns.delete(token);
  if (gameConns.size === 0) {
    connections.delete(gameId);
  }
}

export function hasConnection(gameId: string, token: string): boolean {
  return connections.get(gameId)?.has(token) ?? false;
}

export function getGameConnectionCount(gameId: string): number {
  return connections.get(gameId)?.size ?? 0;
}

export function broadcastToGame(
  gameId: string,
  event: string,
  data: unknown,
): void {
  const gameConns = connections.get(gameId);
  if (!gameConns) return;

  const message = formatSSEMessage(event, data);
  const encoder = new TextEncoder();
  const encoded = encoder.encode(message);

  const staleTokens: string[] = [];
  gameConns.forEach((controller, token) => {
    try {
      controller.enqueue(encoded);
    } catch {
      staleTokens.push(token);
    }
  });
  staleTokens.forEach((token) => {
    gameConns.delete(token);
  });
}

export function sendToPlayer(
  gameId: string,
  token: string,
  event: string,
  data: unknown,
): void {
  const gameConns = connections.get(gameId);
  if (!gameConns) return;

  const controller = gameConns.get(token);
  if (!controller) return;

  const message = formatSSEMessage(event, data);
  const encoder = new TextEncoder();

  try {
    controller.enqueue(encoder.encode(message));
  } catch {
    // Controller closed — remove stale connection
    gameConns.delete(token);
  }
}

export function moveConnectionsToGame(
  oldGameId: string,
  newGameId: string,
): void {
  const oldConns = connections.get(oldGameId);
  if (!oldConns) return;

  let newConns = connections.get(newGameId);
  if (!newConns) {
    newConns = new Map();
    connections.set(newGameId, newConns);
  }

  oldConns.forEach((controller, token) => {
    newConns.set(token, controller);
  });

  connections.delete(oldGameId);
}

export function removeGameConnections(gameId: string): void {
  connections.delete(gameId);
}
