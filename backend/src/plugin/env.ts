import fastifyEnv from "@fastify/env";
import fp from "fastify-plugin";
import { join } from "node:path";

declare module "fastify" {
  export interface FastifyInstance {
    config: {
      CRUNCH_IT_PORT: number;
      MYSQL_DB_HOST: string;
      DB_PORT: string;
      DB_USER: string;
      DB_PASSWORD: string;
      DB_NAME: string;
      REDIS_HOST: string;
      REDIS_PORT: number;
      AWS_REGION: string;
      AWS_UPLOAD_BUCKET_NAME: string;
      AWS_ACCESS_KEY: string;
      AWS_SECRET_KEY: string;
    };
  }
}

const schema = {
  type: "object",
  required: [
    "CRUNCH_IT_PORT",
    "MYSQL_DB_HOST",
    "DB_PORT",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "REDIS_HOST",
    "REDIS_PORT",
    "AWS_REGION",
    "AWS_UPLOAD_BUCKET_NAME",
    "AWS_ACCESS_KEY",
    "AWS_SECRET_KEY",
  ],
  properties: {
    CRUNCH_IT_PORT: {
      type: "number",
      default: 8000,
    },
    MYSQL_DB_HOST: {
      type: "string",
    },
    DB_PORT: {
      type: "string",
    },
    DB_USER: {
      type: "string",
    },
    DB_PASSWORD: {
      type: "string",
    },
    DB_NAME: {
      type: "string",
    },
    REDIS_HOST: {
      type: "string",
    },
    REDIS_PORT: {
      type: "number",
    },
    AWS_REGION: {
      type: "string",
    },
    AWS_UPLOAD_BUCKET_NAME: {
      type: "string",
    },
    AWS_ACCESS_KEY: {
      type: "string",
    },
    AWS_SECRET_KEY: {
      type: "string",
    },
  },
};

export const autoConfig = {
  schema,
  dotenv: {
    path: `${join(import.meta.dirname, "..", "env",".env.local")}`,
    debug: true,
  },
};

export default fp(fastifyEnv, { name: "env" });