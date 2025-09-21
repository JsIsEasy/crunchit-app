import { statusController } from "@controllers";
import type { FastifyInstance } from "fastify";

export function statusRoutes(fastify: FastifyInstance) {
  fastify.get("/status", { websocket: true }, statusController);
}
