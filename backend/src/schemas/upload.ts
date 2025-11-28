import type { FastifySchema } from "fastify";
import { Type } from "@fastify/type-provider-typebox";

const Compression = Type.Object({
  type: Type.String(),
  data: Type.Object({
    originalFormat: Type.String(),
    targetFormat: Type.String(),
  }),
});

const OperationInfo = Type.Union([Compression]);

const uploadBody = Type.Object({
  fileOperation: OperationInfo,
  file: Type.Object({}),
});

const uploadResponses = {
  201: Type.Object({
    message: Type.String(),
    jobId: Type.String(),
  }),
  400: Type.Object({
    message: Type.String(),
  }),
  500: Type.Object({
    message: Type.String(),
  }),
};

const uploadSchema: FastifySchema = {
  body: uploadBody,
  response: uploadResponses,
};

export default uploadSchema;
