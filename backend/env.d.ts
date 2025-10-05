import type { MySQLPool, MySQLPromisePool } from '@fastify/mysql'
declare namespace NodeJS {
    interface ProcessEnv {
      CRUNCH_IT_PORT:number;
      MYSQL_DB_HOST:string;
      DB_PORT:number;
      DB_USER:string;
      DB_PASSWORD:string;
      DB_NAME:string;
    }
  }
