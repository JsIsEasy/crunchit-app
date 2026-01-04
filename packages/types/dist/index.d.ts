type AllowedUploadStatuses = "ready-to-upload" | "ready-to-crunch" | "uploading" | "uploaded" | "upload-failed";
type AllowedCrunchStatuses = "crunching" | "crunched" | "ready-to-download" | "crunch-failed";
type AllowedDownloadStatuses = "downloading" | "downloaded" | "download-failed";
export type uploadingStatus = "uploading..." | "uploaded";
type AllowedCompressionPercentages = 90 | 70 | 50 | 30;
export type AllowedFileStates = AllowedUploadStatuses | AllowedCrunchStatuses | AllowedDownloadStatuses;
export declare enum CrunchTypes {
    Compression = "compression",
    Conversion = "conversion"
}
export type ConversionData = {
    originalFormat: string;
    targetFormat: string;
};
export type Compression = {
    type: CrunchTypes.Compression;
    data?: {
        percentage: AllowedCompressionPercentages;
    };
};
export type Conversion = {
    type: CrunchTypes.Conversion;
    data?: ConversionData;
};
export type CrunchOperation = Compression | Conversion;
export type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;
export {};
//# sourceMappingURL=index.d.ts.map