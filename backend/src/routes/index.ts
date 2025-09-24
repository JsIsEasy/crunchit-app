import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { uploadRoutes } from "./upload.routes";
import { pingRoutes } from "./ping.routes";
import { statusRoutes } from "./status.routes";

export function routes(fastify: FastifyInstance, opts: FastifyPluginOptions, done: () => void) {
  uploadRoutes(fastify);
  pingRoutes(fastify);
  statusRoutes(fastify);
  done();
}