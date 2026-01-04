import { compressionWorker,conversionWorker } from "@worker";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { v7 } from "uuid";

async function uploadFileController(this: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
  try {
    // Use the `parts` iterator to handle files and fields
    const parts = request.parts();

    let fileName;
    let operationInfo: string | undefined = undefined;
    let fileS3Key: string | undefined = undefined;

    for await (const part of parts) {
      // We will improve this approach in future.
      if (part.type === "file") {
        // Handle file upload
        fileName = this.fileManager.rename(part.filename, part.mimetype);
        fileS3Key = await this.awsS3.uploadFile(part);
      } else if (part.type === "field") {
        operationInfo = part.value as string; // Will be removed in future;
      }
    }

    if (!operationInfo || !fileName || !fileS3Key) {
      reply.code(400).send({ message: "File upload failed." });
      return;
    }

    const parsedInfo = JSON.parse(operationInfo) as { type: string; data: any }; // any sucks :);

    const jobId = v7();

    this.mySqlQuery.insert([jobId, fileName, fileS3Key, parsedInfo.type, operationInfo]);

    if (!this.jobManager.getQueue) {
      const queueName = "queue" + Date.now();

      if (parsedInfo.type == "conversion") {
        this.jobManager.start(queueName, (job) => conversionWorker(this, job, fileS3Key));
      } else {
        this.jobManager.start(queueName, (job) => compressionWorker(this, job, fileS3Key));
      }

      this.jobManager.addJobs(jobId, operationInfo);
    }

    reply.code(201).send({ message: "File uploaded successfully.", jobId });
  } catch (error) {
    this.log.error(error);
    reply.code(500).send({ error: "File upload failed." });
  }
}

export { uploadFileController };
