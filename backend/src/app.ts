import Fastify from "fastify";
import { fastifyWebsocket } from "@fastify/websocket";
import { fastifyMysql } from "@fastify/mysql";
import { fastifyEnv } from "@fastify/env";
import { routes } from "./routes";
import { options } from "@schemas";

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  await fastify.register(fastifyEnv, options);
  await fastify.register(fastifyMysql, {
    promise: true,
    connectionString: `mysql://${fastify.config.DB_USER}:${fastify.config.DB_PASSWORD}@${fastify.config.MYSQL_DB_HOST}/${fastify.config.DB_NAME}`,
  });

  fastify.register(fastifyWebsocket);
  fastify.register(routes);

  return fastify;
}
