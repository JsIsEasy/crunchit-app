import type { Job } from "bullmq";
import type { FastifyInstance } from "fastify";

export default async function compressionWorker(fastify: FastifyInstance, job: Job, s3Key: string) {
  try {
    const stream = await fastify.awsS3.downloadFile(s3Key);

    if (!stream) {
      throw new Error();
    }

    const compressed = fastify.ffmpegManager.compressFile(stream, job.data);
  } catch {
    fastify.log.info("compression worker: failed to compress file");
  }
}
