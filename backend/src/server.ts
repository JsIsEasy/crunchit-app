import { buildApp } from "./app";


const start = async () => {
  try {
    const fastify = await buildApp();

    const port = process.env.PORT ? Number(process.env.CRUNCH_IT_PORT) : 8000;
    await fastify.listen({ port: port, host: "0.0.0.0" });
    fastify.log.info(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
