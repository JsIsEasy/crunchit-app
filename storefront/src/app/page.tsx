"use client";

import { Features } from "@/components/ui/features";
import { useWebSocket } from "@/hooks";
import { useCrunchItStore } from "@/store";
import { FileUploaderUI } from "@ui";
import Operations from "./operations/page";
import { FileCrunchInfo } from "@/components/ui/file-crunch-info";

export default function LandingPage() {
  const { crunchOperationStart } = useCrunchItStore((state) => state);

  useWebSocket();

  return (
    <>
      <main className="flex flex-col items-center text-center max-w-3xl">
        <h2 className="text-5xl font-extrabold mb-6">
          Compress & Convert <span className="text-hover-green drop-shadow-[0_0_5px_text-primary-green]">Files</span> in
          Seconds
        </h2>
        <p className="text-lg mb-8 text-gray-300">
          CrunchIt makes your files lighter, faster, and more flexible. Upload, crunch, and download—all in a few
          clicks.
        </p>
        {crunchOperationStart ? <FileUploaderUI /> : <Operations />}
      </main>

      {/* File crunching info */}
      <FileCrunchInfo />
      {/* Features */}
      <Features />
    </>
  );
}
