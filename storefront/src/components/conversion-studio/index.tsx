"use client";

import React, { useState } from "react";
import { Queue } from "./file-queue";
import { Hero, HowItWorks } from "./studio-intro";
import { ToolSidebar } from "./tool-sidebar";
import type { ConversionMode } from "./types";
import { useConversionQueue } from "./use-conversion-queue";
import { Actions, UploadZone, WorkspaceHeader } from "./workspace";

function getActionLabel(processing: boolean, queued: number, ready: number) {
  if (processing) return "Crunching your files...";
  if (queued) return `Crunch ${queued} file${queued === 1 ? "" : "s"}`;
  if (ready) return `Download ${ready === 1 ? "file" : "all files"}`;
  return "Crunch files";
}

type ConversionStudioProps = {
  mode?: ConversionMode;
  children?: React.ReactNode;
};

export function ConversionStudio({ mode, children }: ConversionStudioProps) {
  const queue = useConversionQueue(mode);
  const [isDragging, setIsDragging] = useState(false);
  const studioLayout = mode ? "" : "md:grid md:grid-cols-[235px_1fr]";

  return (
    <main className="mx-auto w-full max-w-[1200px] px-5 sm:px-8">
      {children ?? <Hero />}

      <section
        className={`overflow-hidden rounded-[18px] border border-white/10 bg-[#0b151b]/95 shadow-[0_30px_100px_rgba(0,0,0,.2)] ${studioLayout}`}
        aria-label="File conversion studio"
      >
        {!mode && (
          <ToolSidebar mode={queue.mode} isProcessing={queue.isProcessing} onChange={queue.switchTool} />
        )}

        <section className="min-w-0 p-5 sm:p-7 sm:px-[30px]">
          <WorkspaceHeader tool={queue.tool} />
          <UploadZone
            tool={queue.tool}
            dragging={isDragging}
            disabled={queue.isProcessing}
            onDragChange={setIsDragging}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              queue.addFiles(Array.from(event.dataTransfer.files));
            }}
            onChange={(event) => {
              queue.addFiles(Array.from(event.target.files ?? []));
              event.target.value = "";
            }}
          />

          {queue.notice && (
            <p role="alert" className="mt-2.5 text-[11px] text-[#f2b48c]">
              {queue.notice}
            </p>
          )}

          <Queue
            items={queue.items}
            mode={queue.mode}
            busy={queue.isProcessing}
            onRemove={queue.removeItem}
            onDownload={queue.download}
            onClear={queue.clearCompleted}
          />
          <Actions
            queued={queue.queuedCount}
            ready={queue.readyCount}
            total={queue.items.length}
            isProcessing={queue.isProcessing}
            label={getActionLabel(queue.isProcessing, queue.queuedCount, queue.readyCount)}
            onCrunch={queue.crunchFiles}
          />

          <div className="mt-4 flex items-start justify-between gap-3 text-[10px] leading-5 text-[#64818a]">
            <span>Images are processed in this browser.</span>
            <button
              onClick={queue.addSamples}
              disabled={queue.isProcessing}
              className="whitespace-nowrap text-[#a7bebf] underline underline-offset-4 disabled:opacity-40"
            >
              Try with sample images ↗
            </button>
          </div>
        </section>
      </section>

      <HowItWorks />

      {queue.toast && (
        <div
          role="status"
          className="fixed bottom-5 left-1/2 z-20 -translate-x-1/2 rounded-[10px] border border-[#4af0b5]/30 bg-[#1b3431] px-5 py-3 text-xs text-[#d5f8e9] shadow-[0_12px_40px_rgba(0,0,0,.5)]"
        >
          {queue.toast}
        </div>
      )}
    </main>
  );
}
