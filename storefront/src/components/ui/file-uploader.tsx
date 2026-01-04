"use client";

import { buildApiPayload, buildWsPayload, initFileData, splitFilesIntoCategory } from "@/lib/utils";
import { FileData, useCrunchItStore } from "@/store";
import { CrunchTypes } from "@crunchit/types";
import { useRef } from "react";
import { uploadFiles } from "@/services";
import { findMaxPercent } from "@/lib/utils";
import { DragAndDrop } from "./drag-and-drop";
import { type AxiosProgressEvent } from "axios";
import { useWebSocket } from "@/hooks";

export function FileUploaderUI() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { crunchOperationStart, filesData, setFilesData, updateFileData } = useCrunchItStore((store) => store);

  const { sendMessage } = useWebSocket();

  function onProgress(progressEvent: AxiosProgressEvent, fileData: FileData) {
    if (!progressEvent.total) {
      return fileData;
    }

    const loadedPercent = findMaxPercent(progressEvent.loaded, progressEvent.total);

    if (loadedPercent === 100 && fileData.currentState !== "uploaded") {
      fileData.currentState = "uploaded";
    }

    fileData.progressInfo.progress = loadedPercent;

    return fileData;
  }

  async function uploadFile(key: string) {
    const fileData = { ...filesData[key] };

    if (fileData.currentState !== "uploading") {
      fileData.currentState = "uploading";
    }

    updateFileData(key, fileData);

    const payload = buildApiPayload(fileData);

    const success = await uploadFiles(
      payload,
      (progressEvent) => updateFileData(key, onProgress(progressEvent, fileData)),
      (_) => {
        // error handing needs improvement;
        fileData.currentState = "upload-failed";
        updateFileData(key, fileData);
      }
    );

    const jobId = success?.data.jobId;
    fileData.currentState = "ready-to-crunch";
    fileData.fileInfo.jobId = success?.data.jobId;

    updateFileData(key, fileData);

    const wsPayload = buildWsPayload("status", jobId);

    sendMessage(wsPayload);
  }

  function onSubmit(evt: React.FormEvent) {
    evt.preventDefault();

    const fileKeysToUpload = Object.keys(filesData).filter((key) => filesData[key].currentState === "ready-to-crunch");
    
    fileKeysToUpload.forEach(uploadFile);

    // const crunchItForm = evt.target as HTMLFormElement;
    // const compressionPercentage = crunchItForm.elements.namedItem("compression-selector") as HTMLSelectElement;

    // todo: will be implemented soon...
  }

  function putValidFilesInStore(fileList: FileList) {
    const [validFiles] = splitFilesIntoCategory(Array.from(fileList));

    if (validFiles.length <= 0) {
      console.warn("No files are good enough to be crunched.");
      return;
    }

    validFiles.forEach((file) => {
      if (!crunchOperationStart?.type) {
        return;
      }

      const fileData = initFileData(file, crunchOperationStart.type, crunchOperationStart.meta);

      setFilesData(fileData);
    });
  }

  function prepareFileUpload(evt: React.ChangeEvent) {
    const uploadFileInput = evt.target as HTMLInputElement;

    if (uploadFileInput.files && !!uploadFileInput.files?.length) {
      putValidFilesInStore(uploadFileInput.files);
    }
  }

  return (
    <form className="flex flex-col items-center gap-6 text-center" onSubmit={onSubmit}>
      {/* Drag & Drop Zone */}

      <DragAndDrop putValidFilesInStore={putValidFilesInStore} fileInputRef={fileInputRef} />

      <input
        type="file"
        id="upload-input-file"
        name="upload-file"
        accept="video/*, image/*"
        className="hidden"
        ref={fileInputRef}
        onChange={prepareFileUpload}
        multiple={true}
      />

      {/* Compress Button */}
      <button
        id="submit-btn"
        type="submit"
        className="px-6 py-3 rounded-xl font-semibold transition cursor-pointer
          bg-foreground hover:bg-hover-green text-black"
      >
        ⚡ Crunch It
      </button>
    </form>
  );
}
