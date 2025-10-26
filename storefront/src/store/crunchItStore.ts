import { createStore } from "zustand/vanilla";

type AllowedUploadStatuses = "ready-to-upload" | "uploading" | "uploaded" | "upload-failed";
type AllowedCrunchStatuses = "crunching" | "crunched" | "ready-to-download" | "crunch-failed";
type AllowedDownloadStatuses = "downloading" | "downloaded" | "download-failed";
type AllowedCompressionPercentages = 90 | 70 | 50 | 30;

type AllowedFileStates = AllowedUploadStatuses | AllowedCrunchStatuses | AllowedDownloadStatuses;

type Compression = {
  type: "compression";
  data: {
    percentage: AllowedCompressionPercentages;
  };
};

type Conversion = {
  type: "conversion";
  data: {
    convertFrom: string;
    convertTo: string;
  };
};

type UploadProgress = {
  type: "uploading";
  progress: number;
};

type CrunchItProgress = {
  type: "crunching";
  progress: number;
};

type DownloadProgress = {
  type: "downloading";
  progress: number;
};

type CrunchOperation = Compression | Conversion;
type ProgressInfo = UploadProgress | CrunchItProgress | DownloadProgress;

type FileCrunchInfo = {
  file: File;
  crunchOperation: CrunchOperation;
};

type FileData = { fileInfo: FileCrunchInfo; currentState: AllowedFileStates; progressInfo: ProgressInfo };

type FilesData = {
  [key: string]: FileData;
};

export type CrunchItState = {
  filesData: FilesData;
};

export type CrunchItActions = {
  setFilesData: (fileData: FileData, fileId?: string) => void;
};

export const defaultCrunchItState: CrunchItState = {
  filesData: {},
};

export type CrunchItStore = CrunchItState & CrunchItActions;

export const createCrunchItStore = (initState: CrunchItState = defaultCrunchItState) => {
  return createStore<CrunchItStore>((set) => ({
    ...initState,
    setFilesData: (fileData, fileId = (Date.now() + Date.now()).toString()) =>
      set(() => {
        return { filesData: { [fileId]: fileData } };
      }),
  }));
};
