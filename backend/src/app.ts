import fastifyAutoload from "@fastify/autoload";
import { fastifyEnv } from "@fastify/env";
import Fastify from "fastify";
import path from "path";
import { routes } from "./routes";

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(fastifyAutoload, { dir: path.join(import.meta.dirname, "plugin"), options: {} });
  fastify.register(routes, { prefix: "api" });

  return fastify;
}
