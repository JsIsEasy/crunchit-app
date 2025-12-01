import ffmpeg from "@ffmpeg-installer/ffmpeg";
import { spawn } from "child_process";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { DownloadStream } from "./aws-s3";

declare module "fastify" {
  export interface FastifyInstance {
    ffmpegManager: ReturnType<typeof ffmpegManager>;
  }
}

function compress(fastify: FastifyInstance, stream: DownloadStream, operationInfo: any) {
  return new Promise((resolve, reject) => {
    const process = spawn(ffmpeg.path, [
      "-i",
      "pipe:0",
      "-vcodec",
      "libx264",
      "-crf",
      "26",
      "-preset",
      "fast",
      "-f",
      "mp4",
      "pipe:1",
    ]);

    stream.pipe(process.stdin);

    process.stdin.on("error", (error) => {
      fastify.log.error("faced error on writing");
      reject(error);
    });

    process.stdin.on("finish", fastify.log.info);

    process.stdout.on("error", (error) => {
      fastify.log.error("faced error on reading");
      reject(error);
    });

    process.stdout.on("data", fastify.log.info);

    process.on("exit", fastify.log.info);

    fastify.fileManager
      .save(process.stdout)
      .then((d) => {
        resolve(d);
      })
      .catch(reject);
  });
}

function ffmpegManager(fastify: FastifyInstance) {
  return {
    compressFile: (stream: any, operationInfo: any) => {
      compress(fastify, stream, operationInfo);
    },
  };
}

export default fp(
  (fastify) => {
    fastify.decorate("ffmpegManager", ffmpegManager(fastify));
  },
  { name: "ffmpeg-manager" }
);
