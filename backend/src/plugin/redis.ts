import fastifyRedis, { type FastifyRedisPluginOptions } from "@fastify/redis";
import type { FastifyInstance } from "fastify";

export const autoConfig = (fastify: FastifyInstance): FastifyRedisPluginOptions => {
  return { host: fastify.config.REDIS_HOST, port: fastify.config.REDIS_PORT, maxRetriesPerRequest: null };
};

export default fastifyRedis;
