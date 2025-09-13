"use client";

import { useRef } from "react";
import { supportedMEMETypes } from "@lib/constant";
import { uploadFiles } from "@/services";

type Props = {
  onUploadStart: (formData: FormData) => void;
};

export function FileUploaderUI({ onUploadStart }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openFileUploader() {
    fileInputRef.current?.click();
  }

  function onSubmit(evt: React.FormEvent) {
    evt.preventDefault();

    const controlsCollection = (evt.target as HTMLFormElement).elements;
    const uploadFileInput = controlsCollection.namedItem("uploadFile") as HTMLInputElement;
    const compressionPercent = controlsCollection.namedItem("compression") as HTMLSelectElement;

    const formData = new FormData();

    if (compressionPercent) {
      formData.append("compression-percentage", compressionPercent.value);
    }

    if (uploadFileInput.files && uploadFileInput.files?.length > 0) {
      for (const file of Array.from(uploadFileInput.files)) {
        if (!supportedMEMETypes.test(file.type)) {
          continue;
        }

        formData.append(`files[]`, file);
      }
    }

    onUploadStart(formData);
  }

  return (
    <form className="flex flex-col items-center gap-6 text-center" onSubmit={onSubmit}>
      {/* Drag & Drop Zone */}
      <div
        id="file-uploader-button"
        role="button"
        tabIndex={-1}
        onClick={openFileUploader}
        className="w-full max-w-md p-10 rounded-2xl border-2 border-dashed cursor-pointer
          border-gray-600 bg-gray-900/50 hover:border-green-400 hover:bg-green-900/10 transition"
      >
        <p className="text-lg font-semibold text-white">Drag & Drop your files here</p>
        <p className="text-sm text-gray-400 mt-1">or click to browse</p>
      </div>

      <input
        type="file"
        id="upload-input-file"
        name="upload-file"
        accept="video/*, image/*"
        className="hidden"
        ref={fileInputRef}
        multiple={true}
      />

      {/* Compression Selector */}
      <div className="flex items-center gap-3">
        <label className="text-white">Compression:</label>
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
