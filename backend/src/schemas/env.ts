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
    };
  }
}

const schema = {
  type: "object",
  required: ["CRUNCH_IT_PORT", "MYSQL_DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"],
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
  },
};

export const options = {
  schema,
  dotenv: {
    path: `${join(import.meta.dirname, "..", "env", ".env")}`,
    debug: true,
  },
};
