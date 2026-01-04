import fp from "fastify-plugin";
import sharp from "sharp";

declare module "fastify" {
  export interface FastifyInstance {
    sharp: ReturnType<typeof sharpManager>;
  }
}

function sharpManager() {
  return {
    init: sharp,
    toPng(options?: sharp.PngOptions) {
      return sharp().png(options);
    },
  };
}

export default fp(
  (fastify) => {
    fastify.decorate("sharp", sharpManager());
  },
  { name: "sharp" }
);
