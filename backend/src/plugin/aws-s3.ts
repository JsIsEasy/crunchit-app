import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import type { MultipartFile } from "@fastify/multipart";
import type { FastifyInstance } from "fastify";
import type { UnwrapPromise } from "@crunchit/types";
import fp from "fastify-plugin";
import { sdkStreamMixin } from "@aws-sdk/util-stream-node";

declare module "fastify" {
  export interface FastifyInstance {
    awsS3: ReturnType<typeof aws>;
  }
}

async function download(fastify: FastifyInstance, s3Client: S3Client, s3Key: string) {
  const getCommand = new GetObjectCommand({
    Bucket: fastify.config.AWS_UPLOAD_BUCKET_NAME,
    Key: s3Key,
  });

  try {
    const response = await s3Client.send(getCommand);
    return { body: sdkStreamMixin(response.Body), meta: response.$metadata };
  } catch (error) {
    fastify.log.error(error);
    fastify.log.error("aws-s3: Failed to download file from s3.");
  }
}

async function upload(fastify: FastifyInstance, s3Client: S3Client, file: MultipartFile) {
  const fileKey = `pending/${file.filename}`;
  const uploadClient = new Upload({
    client: s3Client,
    params: {
      Bucket: fastify.config.AWS_UPLOAD_BUCKET_NAME,
      Key: fileKey,
      Body: file.file,
      ContentType: file.mimetype,
      Metadata: { mimeType: file.mimetype },
      ACL: "private",
    },
  });

  try {
    await uploadClient.done();
    fastify.log.info("aws-s3: File has been uploaded to s3 🚀");
    return fileKey;
  } catch (error) {
    fastify.log.error(error);
    fastify.log.error("aws-s3: Failed to upload file to s3.");
  }
}

function aws(fastify: FastifyInstance, s3Client: S3Client) {
  return {
    downloadFile: (s3Key: string) => {
      return download(fastify, s3Client, s3Key);
    },
    uploadFile: (file: MultipartFile) => {
      return upload(fastify, s3Client, file);
    },
    uploadFileStream: (stream: any) => {
      return upload(fastify, s3Client);
    },
  };
}

export default fp(
  async (fastify) => {
    const s3Client = new S3Client({
      region: fastify.config.AWS_REGION,
      credentials: { accessKeyId: fastify.config.AWS_ACCESS_KEY, secretAccessKey: fastify.config.AWS_SECRET_KEY },
    });
    fastify.decorate("awsS3", aws(fastify, s3Client));
  },
  { name: "aws-s3", dependencies: ["env", "ffmpeg-manager"] }
);

export type DownloadStream = Exclude<UnwrapPromise<ReturnType<typeof download>>, undefined>;
