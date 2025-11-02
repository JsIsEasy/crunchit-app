import fastifyMultipart from "@fastify/multipart";

export const autoConfig = {
  limits: { fileSize: 10000000 },
  parts:2,
  files:1,
  fields:1
};

export default fastifyMultipart;
