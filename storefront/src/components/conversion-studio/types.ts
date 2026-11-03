export type ConversionMode = "png" | "jpeg";
export type FileStatus = "queued" | "processing" | "ready" | "failed";

export type QueueItem = {
  id: string;
  file: File;
  previewUrl: string;
  output?: Blob;
  outputUrl?: string;
  status: FileStatus;
  error?: string;
};

export const MAX_FILES = 10;
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_PIXELS = 40_000_000;

export const TOOLS = {
  png: {
    title: "JPG to PNG",
    input: "JPG",
    output: "PNG",
    mimeType: "image/jpeg",
    limits: "JPG / JPEG",
    description: "A fresh format for your images. Same dimensions, every detail.",
  },
  jpeg: {
    title: "PNG to JPG",
    input: "PNG",
    output: "JPG",
    mimeType: "image/png",
    limits: "PNG",
    description: "Share-friendly JPG images. Transparent areas become white.",
  },
} as const;

export type ConversionTool = (typeof TOOLS)[ConversionMode];

export function getOutputFilename(filename: string, mode: ConversionMode) {
  const basename = filename.replace(/\.[^.]+$/, "") || "image";
  return `${basename}.${mode === "png" ? "png" : "jpg"}`;
}
