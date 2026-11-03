import React, { ChangeEvent, DragEvent } from "react";
import { ArrowRight, Bolt, ShieldCheck, Upload } from "lucide-react";
import { ConversionTool } from "./types";

export function WorkspaceHeader({ tool }: { tool: ConversionTool }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-2 text-[10px] text-[#718b94]">
            Image tools <span className="mx-2 text-[#435c66]">/</span> Convert
          </p>
          <h2 className="font-display text-[22px] font-medium tracking-[-.04em] text-[#edf6f5]">
            {tool.title}
          </h2>
        </div>
        <div className="hidden items-center gap-2.5 text-[#54716d] sm:flex">
          <span className="grid h-[41px] w-9 place-items-center rounded-md border border-white/[.08] bg-[#17232c] font-display text-[10px] font-semibold text-[#acc0c6]">
            {tool.input}
          </span>
          <ArrowRight className="size-5" />
          <span className="grid h-[41px] w-9 place-items-center rounded-md border border-[#4af0b5]/25 bg-[#4af0b5]/[.04] font-display text-[10px] font-semibold text-[#4af0b5]">
            {tool.output}
          </span>
        </div>
      </div>
      <p className="-mt-3 mb-6 text-xs text-[#8b9da8]">{tool.description}</p>
    </>
  );
}

export function UploadZone({
  tool,
  dragging,
  disabled,
  onDrop,
  onDragChange,
  onChange,
}: {
  tool: ConversionTool;
  dragging: boolean;
  disabled: boolean;
  onDrop: (event: DragEvent<HTMLLabelElement>) => void;
  onDragChange: (dragging: boolean) => void;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      onDragEnter={(event) => {
        event.preventDefault();
        if (!disabled) onDragChange(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={() => onDragChange(false)}
      onDrop={onDrop}
      className={`block cursor-pointer rounded-xl border border-dashed px-4 py-7 text-center transition sm:py-9 ${dragging ? "border-[#4af0b5] bg-[#4af0b5]/[.04]" : "border-[#42625f] bg-[radial-gradient(ellipse_at_50%_100%,rgba(74,240,181,.024),transparent_70%)] hover:border-[#4af0b5] hover:bg-[#4af0b5]/[.03]"}`}
    >
      <span className="mx-auto mb-3 grid size-[43px] place-items-center rounded-xl border border-[#4af0b5]/20 bg-[#4af0b5]/[.04] text-[#4af0b5]">
        <Upload className="size-5" />
      </span>
      <strong className="text-sm font-medium text-[#edf6f5]">
        Drop your images here, or{" "}
        <span className="text-[#4af0b5] underline underline-offset-4">
          browse files
        </span>
      </strong>
      <small className="mt-2.5 block text-[10px] text-[#758e98]">
        {tool.limits} · Up to 10 files · 10 MB each
      </small>
      <input
        onChange={onChange}
        disabled={disabled}
        type="file"
        accept={tool.mimeType}
        multiple
        className="sr-only"
        aria-label="Choose images to convert"
      />
    </label>
  );
}

export function Actions({
  queued,
  ready,
  total,
  isProcessing,
  label,
  onCrunch,
}: {
  queued: number;
  ready: number;
  total: number;
  isProcessing: boolean;
  label: string;
  onCrunch: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-4 border-t border-white/[.075] pt-[18px]">
      <p className="flex max-w-40 items-center gap-1.5 text-[10px] text-[#68858d]">
        <ShieldCheck className="size-3" />
        {isProcessing
          ? "Converting images..."
          : ready
            ? `${ready} of ${total} ready to download`
            : "Up to 10 files, one simple batch"}
      </p>
      <button
        onClick={onCrunch}
        disabled={isProcessing || (!queued && !ready)}
        className="flex items-center justify-center gap-2 rounded-lg border border-[#6effc6] bg-[#4af0b5] px-3 py-2.5 text-[11px] font-bold text-[#063425] transition hover:bg-[#79ffcc] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-xs"
      >
        <Bolt className="size-3.5" />
        {label}
        <ArrowRight className="size-3.5" />
      </button>
    </div>
  );
}
