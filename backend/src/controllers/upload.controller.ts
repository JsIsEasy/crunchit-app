import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

async function uploadFileController(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const parts = request.parts();

  for await (const part of parts) {
    if (part.type === "file") {
      this.fileManager.upload(part);
    } else {
      console.log(part);
    }
  }
  reply.send();
}

export { uploadFileController };
