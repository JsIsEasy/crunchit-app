import fastifyMultipart from "@fastify/multipart";

export const autoConfig = {
  limits: { fileSize: 10000000 },
};

export default fastifyMultipart;
