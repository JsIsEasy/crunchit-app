import { uploadFileController } from "@controllers";
import { uploadSchema } from "@schemas";
import type { FastifyInstance } from "fastify";

export function uploadRoutes(fastify: FastifyInstance) {
  fastify.post("/upload", uploadFileController);
}
