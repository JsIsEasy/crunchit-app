import type { Job } from "bullmq";
import type { FastifyInstance } from "fastify";

export default async function conversionWorker(fastify: FastifyInstance, job: Job, s3Key: string) {
  try {
    const response = await fastify.awsS3.downloadFile(s3Key);

    if (!response) {
      throw new Error("Failed to download file from S3");
    }
    const { body, meta } = response;
  } catch {
    fastify.log.info("conversion worker: failed to conversion file");
  }
}
