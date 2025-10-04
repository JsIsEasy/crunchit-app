import type { FastifyRequest, FastifyReply } from "fastify";
import { pipeline } from "node:stream/promises";
import fs from "node:fs";

async function uploadFileController(request: FastifyRequest, reply: FastifyReply) {
    const parts = request.parts()
    for await (const part of parts) {
      if (part.type === 'file') {
        await pipeline(part.file, fs.createWriteStream(part.filename));
      } else {
        // part.type === 'field
        console.log(part);
      }
    }
    reply.send();
}

export { uploadFileController };
