import type { RefObject } from "react";

type Props = {
  putValidFilesInStore: (fileList: FileList) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
};

export function DragAndDrop({ putValidFilesInStore, fileInputRef }: Props) {
  function catchIt(evt: React.DragEvent) {
    evt.currentTarget.classList.remove("border-green-400", "bg-green-900/10");
    evt.preventDefault();

    putValidFilesInStore(evt.dataTransfer.files);
  }

  function openFileUploader() {
    fileInputRef.current?.click();
  }

  function handleDragAndDrop(evt: React.MouseEvent) {
    evt.currentTarget.classList.add("border-green-400", "bg-green-900/10");
  }

  function onDragOver(evt: React.DragEvent) {
    evt.preventDefault();
  }
  return (
    <div
      id="file-uploader-button"
      role="button"
      onDrop={catchIt}
      onDragEnter={handleDragAndDrop}
      onDragOver={onDragOver}
      onDragLeave={handleDragAndDrop}
      tabIndex={-1}
      onClick={openFileUploader}
      className="w-full max-w-md p-10 rounded-2xl border-2 border-dashed cursor-pointer
      border-gray-600 bg-gray-900/50 hover:border-green-400 hover:bg-green-900/10 transition"
    >
      <p className="text-lg font-semibold text-white">Drag & Drop your files here</p>
      <p className="text-sm text-gray-400 mt-1">or click to browse</p>
    </div>
  );
}
