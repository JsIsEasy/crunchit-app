import { createStore } from "zustand/vanilla";
import { AllowedFileStates, Compression, Conversion, ConversionData, CrunchTypes } from "@crunchit/types";

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
type CrunchOperationType = Compression["type"] | Conversion["type"];
type CrunchOperationStart = {
  type: Compression["type"] | Conversion["type"];
  meta?: any;
};

type ProgressInfo = UploadProgress | CrunchItProgress | DownloadProgress;

export type FileCrunchInfo = {
  file: File;
  jobId?: string;
  crunchOperation: CrunchOperation;
};

export type FileData = { fileInfo: FileCrunchInfo; currentState: AllowedFileStates; progressInfo: ProgressInfo };

type FilesData = {
  [key: string]: FileData;
};

export type CrunchItState = {
  crunchOperationStart?: CrunchOperationStart;
  filesData: FilesData;
};

export type CrunchItActions = {
  // for now conversion is in place for images
  initOperation: (conversionData: ConversionData, operationType?: CrunchOperationType) => void;
  setFilesData: (fileData: FileData, fileId?: string) => void;
  updateFileData: (fileId: string, fileUpdate: FileData) => void;
};

export const defaultCrunchItState: CrunchItState = {
  crunchOperationStart: undefined,
  filesData: {},
};

export type CrunchItStore = CrunchItState & CrunchItActions;

export const createCrunchItStore = (initState: CrunchItState = defaultCrunchItState) => {
  return createStore<CrunchItStore>((set) => ({
    ...initState,
    //todo: Almost similar with setFilesData, Find improvement
    updateFileData: (fileId: string, fileUpdate: FileData) => {
      set((state) => ({ filesData: { ...state.filesData, [fileId]: fileUpdate } }));
    },
    initOperation: (conversionData, crunchOperationType = CrunchTypes.Conversion) => {
      set(() => ({ crunchOperationStart: { type: crunchOperationType, meta: conversionData }, filesData: {} }));
    },
    resetInitOperation: () => {
      set((state) => ({ ...state, crunchOperationStart: undefined }));
    },
    setFilesData: (fileData, fileId = (Date.now() + Date.now()).toString()) =>
      set((state) => ({ filesData: { ...state.filesData, [fileId]: fileData } })),
  }));
};
