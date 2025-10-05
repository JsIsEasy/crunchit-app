import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { v4 } from "uuid";

async function uploadFileController(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  const outerThis = this;
  const parts = request.parts();

  let compressionPercent: string;
  
  const fileNames = [];

  for await (const part of parts) {
    if (part.type === "file") {
      const fileName = await this.fileManager.upload(part);
      fileNames.push(fileName);
    } else {
      compressionPercent = part.value as string;
    }
  }

  fileNames.forEach((name) => {
    outerThis.mySqlQuery.insert([v4(), name, "abcde", "compression", compressionPercent]);
  });

  reply.send({ message: "success", code: 201 });
}

export { uploadFileController };
