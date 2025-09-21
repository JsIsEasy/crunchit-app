import { uploadFileController } from "@controllers";
import type { FastifyInstance } from "fastify";

export function uploadRoutes(fastify: FastifyInstance) {
  fastify.post("/upload", uploadFileController);
}
