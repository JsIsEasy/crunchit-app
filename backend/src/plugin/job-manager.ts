import { type FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Queue, Worker, type Processor } from "bullmq";

declare module "fastify" {
  export interface FastifyInstance {
    jobManager: ReturnType<typeof jobManager>;
  }
}

type JobManager = {
  _queue: null | Queue;
  _uploadQueue: null | Queue;
  getQueue: null | Queue;
  start: (name: string, cb: Processor<any, any, string> | null | undefined) => Worker;
  addJobs: <J extends string, D>(jobName: J, jobData: D) => void;
};

function jobManager(fastify: FastifyInstance): JobManager {
  // Implemented for single queue for now will be scaled later.
  return {
    _queue: null,
    _uploadQueue: null,
    get getQueue() {
      return this._queue;
    },
    start(name: string, cb) {
      this._queue = new Queue(name, {
        connection: fastify.redis,
      });
      return new Worker(name, cb, { connection: fastify.redis });
    },
    async addJobs(jobName, jobData) {
      if (!this._queue) {
        fastify.log.error("No queue exist!:");
        return;
      }
      return this._queue.add(jobName, jobData, { removeOnComplete: true, removeOnFail: false });
    },
  };
}

export default fp(
  (fastify) => {
    fastify.decorate("jobManager", jobManager(fastify));
  },
  { name: "job-manager" }
);
