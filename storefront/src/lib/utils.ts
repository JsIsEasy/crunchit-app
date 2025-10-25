import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MAX_FILE_SIZE, supportedMEMETypes } from "./constant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function splitFilesIntoCategory(files: File[]) {
  const validFiles: File[] = [];
  const invalidFiles: File[] = [];

  files.forEach((file) => {
    const isInValid = !supportedMEMETypes.test(file.type) ||  file.size > MAX_FILE_SIZE;
    isInValid ? invalidFiles.push(file) : validFiles.push(file);
  });

  return [validFiles, invalidFiles];
}

export function findMaxPercent(loaded: number, total: number) {
  const maxPercent = 100;

  const fixedValue = Number((loaded / total).toFixed(2));

  return Math.min(fixedValue * maxPercent, maxPercent);
}
