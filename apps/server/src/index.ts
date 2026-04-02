// biome-ignore assist/source/organizeImports: Instrumentation must be the first import
import "./instrument.js";
import { createServer } from "node:http";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { Server } from "socket.io";
import * as Sentry from "@sentry/node";
import { getActiveConnectionCount, getGameCount } from "./game-store.js";
import { registerSocketHandlers } from "./socket-handlers.js";

const PORT = parseInt(process.env.PORT || "3001", 10);
const HOST = "0.0.0.0";

const fastify = Fastify({
  serverFactory: (handler) => {
    const server = createServer((req, res) => {
      handler(req, res);
    });
    return server;
  },
});

Sentry.setupFastifyErrorHandler(fastify);

const CORS = "*";

await fastify.register(cors, {
  origin: CORS,
});

const io = new Server(fastify.server, {
  cors: {
    origin: CORS,
  },
});

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket);
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

fastify.get("/status", async () => {
  return {
    status: "ok",
    uptime: process.uptime(),
    activeConnections: getActiveConnectionCount(),
    activeGames: getGameCount(),
    socketEngineClientsCount: io.engine.clientsCount,
    cors: CORS,
    timestamp: Date.now(),
  };
});

fastify.get("/debug-sentry", () => {
  throw new Error("My first Sentry error!");
});

try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`Server listening on http://${HOST}:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
