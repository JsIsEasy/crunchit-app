import type { MultipartFile } from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fs from "fs";
import * as crypto from "node:crypto";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";

declare module "fastify" {
  export interface FastifyInstance {
    fileManager: ReturnType<typeof createFileManager>;
  }
}

function createFileManager(fastify: FastifyInstance) {
  return {
    get getDirPath() {
      return join(import.meta.dirname, "..", "..", "storage");
    },
    ensureDir(dir: string) {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    },

    async upload(file: MultipartFile) {
      const fileName = this.rename(file.filename, file.mimetype);
      const dirPath = this.getDirPath;
      const destPath = join(dirPath, fileName);
      this.ensureDir(dirPath);
      await pipeline(file.file, fs.createWriteStream(destPath));
      return fileName;
    },

    async save(stream: NodeJS.ReadableStream) {
      const dirPath = this.getDirPath;
      const destPath = join(dirPath, "test.mp4");
      this.ensureDir(dirPath);
      console.log(destPath);
      await pipeline(stream, fs.createWriteStream(destPath));
    },

    async move(source: string, destination: string) {
      await fs.promises.rename(source, destination);
    },

    async unlink(fileName: string) {
      try {
        const filePath = join(this.getDirPath, fileName);
        await fs.promises.unlink(filePath);
      } catch (err) {
        if (isErrnoException(err) && err.code === "ENOENT") {
          fastify.log.warn(`File path '${fileName}' not found`);
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
