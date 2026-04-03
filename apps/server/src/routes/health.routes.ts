import type { FastifyInstance } from "fastify";
import type { Server } from "socket.io";
import {
  getActiveConnectionCount,
  getGameCount,
} from "../shared/game.store.js";

export function registerRoutes(fastify: FastifyInstance, io: Server) {
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
      cors: "*",
      timestamp: Date.now(),
    };
  });

  fastify.get("/debug-sentry", () => {
    throw new Error("My first Sentry error!");
  });
}
