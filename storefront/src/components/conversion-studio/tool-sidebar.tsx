import React from "react";
import { FileText, ImageIcon, ShieldCheck } from "lucide-react";
import { ConversionMode } from "./types";

export function ToolSidebar({
  mode,
  isProcessing,
  onChange,
}: {
  mode: ConversionMode;
  isProcessing: boolean;
  onChange: (mode: ConversionMode) => void;
}) {
  const tools = [
    { mode: "png" as const, label: "JPG to PNG" },
    { mode: "jpeg" as const, label: "PNG to JPG" },
  ];
  return (
    <aside className="border-b border-white/[.075] bg-[#0d171d]/90 p-3 md:flex md:min-h-[510px] md:flex-col md:border-b-0 md:border-r md:p-6 md:px-4">
      <div>
        <p className="mb-2 hidden px-2.5 text-[9px] font-bold tracking-[0.17em] text-[#6b828b] md:block">IMAGE TOOLS</p>
        <div className="flex gap-1.5 md:block">
          {tools.map((tool) => (
            <button
              key={tool.mode}
              onClick={() => onChange(tool.mode)}
              disabled={isProcessing}
              aria-pressed={tool.mode === mode}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-2 py-2.5 text-left text-[10px] transition md:mb-1 md:w-full md:justify-start md:gap-3 md:px-2.5 md:text-xs ${tool.mode === mode ? "border-[#4af0b5]/20 bg-[#4af0b5]/[.04] text-[#4af0b5]" : "border-transparent text-[#9bb0b8] hover:bg-white/[.035]"}`}
            >
              <ImageIcon className="size-3.5 md:size-[17px]" />
              {tool.label}
              <span className="ml-auto hidden text-base md:inline">↗</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 hidden md:block">
        <p className="mb-2 px-2.5 text-[9px] font-bold tracking-[0.17em] text-[#6b828b]">ON THE HORIZON</p>
        {["Image compression", "PDF tools", "Video tools"].map((label) => (
          <button
            disabled
            key={label}
            className="mb-1 flex w-full items-center gap-3 rounded-lg px-2.5 py-3 text-left text-xs text-[#9bb0b8]"
          >
            {label === "Image compression" ? (
              <ImageIcon className="size-[17px]" />
            ) : (
              <FileText className="size-[17px]" />
            )}
            {label}
            <span className="ml-auto rounded border border-white/[.07] px-1 py-0.5 text-[8px] text-[#6e858d]">
              SOON
            </span>
          </button>
        ))}
      </div>
      <div className="mt-auto hidden border-t border-white/[.075] px-3 pt-4 text-[11px] leading-[1.6] text-[#728d95] md:block">
        <ShieldCheck className="mb-2 size-[18px] text-[#4af0b5]" />A focused workspace.
        <br />
        No sign-up. No distractions.
      </div>
    </aside>
  );
}
