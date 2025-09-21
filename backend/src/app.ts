import Fastify from "fastify";
import {fastifyWebsocket} from "@fastify/websocket";
import { routes } from "./routes";

export async function buildApp() {
  const fastify = Fastify({
    logger: true,
  });

  fastify.register(fastifyWebsocket);
  fastify.register(routes);

  return fastify;
}
