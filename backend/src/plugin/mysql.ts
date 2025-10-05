import fastifyMysql, {
  type MySQLPromisePool
} from "@fastify/mysql";
import type { FastifyInstance } from "fastify";

// if you passed promise = true
declare module "fastify" {
  interface FastifyInstance {
    mysql: MySQLPromisePool;
  }
}

export const autoConfig = (fastify: FastifyInstance) => {
  return {
    promise: true,
    connectionString: `mysql://${fastify.config.DB_USER}:${fastify.config.DB_PASSWORD}@${fastify.config.MYSQL_DB_HOST}/${fastify.config.DB_NAME}`,
  };
};

export default fastifyMysql;
