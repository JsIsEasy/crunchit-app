import { buildApp } from "./app";

const start = async () => {
  try {
    const app = await buildApp();

    const port = process.env.PORT ? Number(process.env.PORT) : 8000;
    await app.listen({ port: port, host: "0.0.0.0" });
    console.log(`🚀 Server running on http://localhost:${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
