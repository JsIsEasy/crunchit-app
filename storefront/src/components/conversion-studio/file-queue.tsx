import React from "react";
import Image from "next/image";
import { CheckCircle2, Download, X } from "lucide-react";
import { ConversionMode, FileStatus, QueueItem, getOutputFilename } from "./types";

export function formatBytes(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function Queue({
  items,
  mode,
  busy,
  onRemove,
  onDownload,
  onClear,
}: {
  items: QueueItem[];
  mode: ConversionMode;
  busy: boolean;
  onRemove: (id: string) => void;
  onDownload: (item: QueueItem) => void;
  onClear: () => void;
}) {
  const ready = items.filter((item) => item.status === "ready").length;
  return (
    <>
      <div className="mb-3 mt-6 flex items-center justify-between text-xs text-[#edf6f5]">
        <span>
          Your files{" "}
          <span className="ml-1.5 rounded bg-[#1c2a32] px-1.5 py-0.5 text-[10px] text-[#93abb5]">{items.length}</span>
        </span>
        <button
          onClick={onClear}
          disabled={busy || !ready}
          className="text-[10px] text-[#748d96] transition hover:text-[#4af0b5] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear completed
        </button>
      </div>
      <div className="grid gap-2">
        {!items.length && (
          <div className="rounded-lg border border-white/[.075] p-4 text-center text-[11px] text-[#6d858e]">
            Your files will appear here. Ready when you are.
          </div>
        )}
        {items.map((item) => (
          <QueueRow
            key={item.id}
            item={item}
            mode={mode}
            busy={busy}
            onRemove={() => onRemove(item.id)}
            onDownload={() => onDownload(item)}
          />
        ))}
      </div>
    </>
  );
}

export function QueueRow({
  item,
  mode,
  busy,
  onRemove,
  onDownload,
}: {
  item: QueueItem;
  mode: ConversionMode;
  busy: boolean;
  onRemove: () => void;
  onDownload: () => void;
}) {
  const labels: Record<FileStatus, string> = {
    queued: "Queued",
    processing: "Crunching...",
    ready: "Ready",
    failed: "Failed",
  };
  const color =
    item.status === "ready"
      ? "text-[#4af0b5]"
      : item.status === "failed"
        ? "text-[#f19494]"
        : item.status === "processing"
          ? "text-[#e1bf75]"
          : "text-[#97aab4]";
  return (
    <div className="flex items-center gap-2 rounded-lg border border-white/[.045] bg-white/[.02] p-2.5 sm:gap-3 sm:p-3">
      <div className="h-[38px] w-[35px] shrink-0 overflow-hidden rounded bg-[#1c2c34]">
        <Image src={item.previewUrl} alt="" width={35} height={38} unoptimized className="size-full object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] text-[#cedbdf]">{item.file.name}</p>
        <div className="mt-1 flex gap-2 text-[9px] text-[#708b96]">
          <span>{formatBytes(item.file.size)}</span>
          <span>
            {item.status === "ready" && item.output
              ? `→ ${formatBytes(item.output.size)}`
              : mode === "png"
                ? "JPG → PNG"
                : "PNG → JPG"}
          </span>
        </div>
        {item.error && <p className="mt-1 text-[10px] text-[#f19494]">{item.error}</p>}
      </div>
      <span title={item.error} className={`whitespace-nowrap text-[9px] ${color}`}>
        {item.status === "ready" && <CheckCircle2 className="mr-1 inline size-3" />}
        {labels[item.status]}
      </span>
      {item.status === "ready" && (
        <button
          onClick={onDownload}
          aria-label={`Download ${getOutputFilename(item.file.name, mode)}`}
          className="rounded-md border border-[#4af0b5]/15 bg-[#4af0b5]/[.04] p-1.5 text-[#4af0b5]"
        >
          <Download className="size-3" />
        </button>
      )}
      <button
        onClick={onRemove}
        disabled={busy}
        aria-label={`Remove ${item.file.name}`}
        className="p-1 text-[#536f79] transition hover:text-[#e0eded] disabled:opacity-40"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
