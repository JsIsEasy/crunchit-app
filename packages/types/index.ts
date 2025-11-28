// Upload statuses
type AllowedUploadStatuses = "ready-to-crunch" | "uploading" | "uploaded" | "upload-failed";

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

// Compression type
export type Compression = {
  type: CrunchTypes.Compression;
  data: {
    percentage: AllowedCompressionPercentages;
  };
};

// Conversion type
export type Conversion = {
  type: CrunchTypes.Conversion;
  data: {
    originalFormat: string;
    targetFormat: string;
  };
};

// Union of all crunch operations
export type CrunchOperation = Compression | Conversion;

export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
