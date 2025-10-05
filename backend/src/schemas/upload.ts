import type { FastifySchema } from "fastify";

const uploadBody = {
  type: "object",
  properties: {
    "compression-percentage": {
      type: "string",
    },
    "files[]": {
      type: "object",
    },
  },
};

const uploadResponses = {};

export const uploadSchema: FastifySchema = {
  body: uploadBody,
  response: uploadResponses,
};
