import Fastify from "fastify";

// Routes

export async function buildApp() {
  const app = Fastify({
    logger: true,
  });

  return app;
}
