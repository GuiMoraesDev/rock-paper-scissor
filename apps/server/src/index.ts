import { createServer } from "node:http";
import cors from "@fastify/cors";
import Fastify from "fastify";
import { Server } from "socket.io";
import { registerSocketHandlers } from "./socket-handlers.js";

const PORT = parseInt(process.env.PORT || "3001", 10);

const fastify = Fastify({
  serverFactory: (handler) => {
    const server = createServer((req, res) => {
      handler(req, res);
    });
    return server;
  },
});

const CORS = [
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : false,
  "https://rock-paper-scissor.guimoraes.dev",
  "https://rock-paper-scissor-web-steel.vercel.app",
].filter((link) => !!link);

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

try {
  await fastify.listen({ port: PORT, host: "0.0.0.0" });
  console.log(`Server listening on http://localhost:${PORT}`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
