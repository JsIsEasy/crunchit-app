import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAX_FILE_SIZE, supportedMEMETypes } from "./constant";
import { FileData } from "@/store";
import { CrunchTypes } from "@crunchit/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitFilesIntoCategory(files: File[]) {
  const validFiles: File[] = [];
  const invalidFiles: File[] = [];

  files.forEach((file) => {
    const isInValid = !supportedMEMETypes.test(file.type) || file.size > MAX_FILE_SIZE;
    isInValid ? invalidFiles.push(file) : validFiles.push(file);
  });

  return [validFiles, invalidFiles];
}

export function findMaxPercent(loaded: number, total: number) {
  const maxPercent = 100;

  const fixedValue = Number((loaded / total).toFixed(2));

  return Math.min(fixedValue * maxPercent, maxPercent);
}

export function buildApiPayload(fileData: FileData) {
  const formData = new FormData();

  const operationInfo = JSON.stringify(fileData.fileInfo.crunchOperation);

  formData.append("file", fileData.fileInfo.file);
  formData.append("fileOperation", operationInfo); // Order is important

  return formData;
}

export function initFileData(file: File, type: CrunchTypes, data: any): FileData {
  switch (type) {
    case CrunchTypes.Compression: {
      return {
        fileInfo: { file, crunchOperation: { type, data: { percentage: 70 } } },
        currentState: "ready-to-crunch",
        progressInfo: { progress: -10, type: "uploading" },
      };
    }
    default: {
      return {
        fileInfo: { file, crunchOperation: { type, data: { originalFormat: "jpeg", targetFormat: "png" } } },
        currentState: "ready-to-crunch",
        progressInfo: { progress: -10, type: "uploading" },
      };
    }
  }
}

export function buildWsPayload(type: string, jobId: string) {
  const payload = { type: "status", jobId };
  return JSON.stringify(payload);
}
