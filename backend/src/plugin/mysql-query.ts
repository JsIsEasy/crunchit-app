import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  export interface FastifyInstance {
    mySqlQuery: ReturnType<typeof mySqlQueryManager>;
  }
}

function mySqlQueryManager(fastify: FastifyInstance) {
  return {
    insert(values: string[]) {
      const placeholders = Array.from(values, (v) => "?");
      const keys = ["job_id", "file_name", "s3_key", "operation_type", "compression_level"];
      return fastify.mysql.query(`INSERT INTO jobs (${keys.join(" , ")}) VALUES (${placeholders.join(" ,")});`, values);
    },
  };
}

export default fp(
  (fastify) => {
    fastify.decorate("mySqlQuery", mySqlQueryManager(fastify));
  },
  { name: "mysql-query" }
);
