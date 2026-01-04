// Upload statuses
type AllowedUploadStatuses = "ready-to-upload" | "ready-to-crunch" | "uploading" | "uploaded" | "upload-failed";

// Crunch statuses
type AllowedCrunchStatuses = "crunching" | "crunched" | "ready-to-download" | "crunch-failed";

// Download statuses
type AllowedDownloadStatuses = "downloading" | "downloaded" | "download-failed";

export type uploadingStatus = "uploading..." | "uploaded";

// Compression percentages
type AllowedCompressionPercentages = 90 | 70 | 50 | 30;

// Combined file states
export type AllowedFileStates = AllowedUploadStatuses | AllowedCrunchStatuses | AllowedDownloadStatuses;

// Crunch types enum
export enum CrunchTypes {
  Compression = "compression",
  Conversion = "conversion",
}

export type ConversionData = {
  originalFormat: string;
  targetFormat: string;
}

// Compression type
export type Compression = {
  type: CrunchTypes.Compression;
  data?: {
    percentage: AllowedCompressionPercentages;
  };
};

// Conversion type
export type Conversion = {
  type: CrunchTypes.Conversion;
  data?: ConversionData;
};

// Union of all crunch operations
export type CrunchOperation = Compression | Conversion;

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
