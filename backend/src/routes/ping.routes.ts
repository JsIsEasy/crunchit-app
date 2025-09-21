import type { FastifyInstance } from "fastify";

export function pingRoutes(fastify: FastifyInstance) {
  fastify.get("/ping", (req,res)=>{
    res.send("pong");
  });
}
