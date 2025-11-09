"use client";

import { buildApiPayload, initFileData, splitFilesIntoCategory } from "@/lib/utils";
import { CrunchTypes, useCrunchItStore } from "@/store";
import { useRef } from "react";
import { uploadFiles } from "@/services";
import { findMaxPercent } from "@/lib/utils";
import { DragAndDrop } from "./drag-and-drop";

export function FileUploaderUI() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { filesData, setFilesData, updateFileData } = useCrunchItStore((store) => store);

  const onUploadStart = () => {
    // Todo: Need improvement
    const fileKeysToUpload = Object.keys(filesData).filter((key) => filesData[key].currentState === "ready-to-crunch");

    fileKeysToUpload.forEach((key) => {
      const fileData = { ...filesData[key] };

      if (fileData.currentState !== "uploading") {
        fileData.currentState = "uploading";
      }

      updateFileData(key, fileData);

      const payload = buildApiPayload(fileData);

      uploadFiles(
        payload,
        (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const loadedPercent = findMaxPercent(progressEvent.loaded, progressEvent.total);

          if (loadedPercent === 100 && fileData.currentState !== "uploaded") {
            fileData.currentState = "uploaded";
          }

          fileData.progressInfo.progress = loadedPercent;

          updateFileData(key, fileData);
        },
        (error) => {
          fileData.currentState = "upload-failed";
          updateFileData(key, fileData);
        }
      );
    });
  };

  function onSubmit(evt: React.FormEvent) {
    evt.preventDefault();

    onUploadStart();

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
      const fileData = initFileData(file, CrunchTypes.compression);
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

      {/* Compression Selector */}
      <div className="flex items-center gap-3">
        <label htmlFor="compression-selector" className="text-white">
          Compression:
        </label>
        <select
          id="compression-selector"
          name="compression"
          className="bg-gray-800 text-white rounded-lg px-3 py-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
        >
          <option value="90" defaultChecked>
            90% (Light)
          </option>
          <option value="70">70% (Balanced)</option>
          <option value="50">50% (Strong)</option>
          <option value="30">30% (Max Crunch)</option>
        </select>
      </div>

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
