import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {v4} from "uuid";

async function uploadFileController(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // Use the `parts` iterator to handle files and fields
    const parts = request.parts();

    let fileName;
    let operationInfo:string | null = null;
    
    for await (const part of parts) {
      if (part.type === "file") {
        // Handle file upload
        fileName = await this.fileManager.upload(part);
      } else if (part.type === "field") {
        operationInfo = part.value as string; // Will be removed in future;
      }
    }

    if(!operationInfo || !fileName) {
      reply.code(400).send({message:'File upload failed.'});
      return;
    }

    if(!operationInfo && fileName) {
      this.fileManager.unlink(fileName);
      reply.code(400).send({message:'File upload failed.'});
      return;
    }
    
    const parsedInfo = JSON.parse(operationInfo) as {type: string, data:any}; // any sucks :);
    
    const jobId = v4();

    this.mySqlQuery.insert([jobId, fileName, "abcde", parsedInfo.type, operationInfo]);
    
    reply.code(201).send({ message: "File uploaded successfully.", jobId});
  } catch (error) {
    this.log.error(error);
    reply.code(500).send({ error: "File upload failed." });
  }
}

export { uploadFileController };
