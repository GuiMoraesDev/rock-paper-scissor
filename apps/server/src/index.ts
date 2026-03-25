import { createServer } from "node:http";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./game-engine.js";

const PORT = parseInt(process.env.PORT || "3001", 10);

const fastify = Fastify({
  serverFactory: (handler) => {
    const server = createServer((req, res) => {
      handler(req, res);
    });
    return server;
  },
});

await fastify.register(cors, {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
});

const io = new Server(fastify.server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
  },
});

io.on("connection", (socket) => {
  registerSocketHandlers(io, socket);
});

fastify.get("/health", async () => {
  return { status: "ok" };
});

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Server listening on http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
