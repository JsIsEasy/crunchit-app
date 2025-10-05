import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import type { MultipartFile } from "@fastify/multipart";
import fs from "fs";
import { pipeline } from "node:stream/promises";
import * as crypto from "node:crypto";
import path, { join } from "node:path";

declare module "fastify" {
  export interface FastifyInstance {
    fileManager: ReturnType<typeof createFileManager>;
  }
}

function createFileManager(fastify: FastifyInstance) {
  return {
    ensureDir(dir: string) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    },

    async upload(file: MultipartFile) {
      const fileName = this.rename(file.filename, file.mimetype);
      const destPath = join(import.meta.dirname, "..", "..", "storage", fileName);
      await pipeline(file.file, fs.createWriteStream(destPath));
      return fileName;
    },

    async move(source: string, destination: string) {
      await fs.promises.rename(source, destination);
    },

    async unlink(filePath: string) {
      try {
        await fs.promises.unlink(filePath);
      } catch (err) {
        if (isErrnoException(err) && err.code === "ENOENT") {
          fastify.log.warn(`File path '${filePath}' not found`);
        } else {
          throw err;
        }
      }
    },

    rename(fileName: string, mimeType: string) {
      const fileExtension = mimeType.split("/")[1];
      return fileName.substring(0, 10) + "_" + this.randomSuffix() + "." + fileExtension;
    },

    randomSuffix() {
      return crypto.randomBytes(8).toString("hex");
    },
  };
}

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

export default fp(
  async (fastify) => {
    fastify.decorate("fileManager", createFileManager(fastify));
  },
  {
    name: "file-manager",
  }
);
