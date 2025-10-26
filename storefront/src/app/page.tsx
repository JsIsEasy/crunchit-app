"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { findMaxPercent } from "@/lib/utils";
import { useCrunchItStore } from "@/store";
import { uploadFiles } from "@services";
import { FileUploaderUI, Progress } from "@ui";
import { FileDiff, FileText } from "lucide-react";

export default function LandingPage() {
  const { filesData } = useCrunchItStore((state) => state);

  const onUploadStart = async () => {
    const filesToUpload = Object.keys(filesData).map((key) => {
      const fileData = filesData[key];
      const form = new FormData();

      form.append("files", fileData.fileInfo.file);
    });

    uploadFiles(formData, (progressEvent) => {
      if (!progressEvent.total) {
        return;
      }

      const loadedPercent = findMaxPercent(progressEvent.loaded, progressEvent.total);
    });
  };

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
        <FileUploaderUI onUploadStartAction={onUploadStart} />
      </main>

      <section id="file-cards" className="mt-20 flex gap-10">
        {Object.keys(filesData).map((fileId) => {
          const fileData = filesData[fileId];
          return (
            <Card key={fileId}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div>
                    <FileText size={40} />
                  </div>
                  <div>Annual Report 2024.pdf</div>
                </CardTitle>
                <CardDescription>{fileData.currentState}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-2 border rounded-2xl">
                  <Progress value={fileData.progressInfo.progress} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Features */}
      <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl w-full">
        <div className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
          <h3 className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
            Fast Compression
          </h3>
          <p className="text-gray-300">Shrink images, PDFs, and videos instantly without losing quality.</p>
        </div>
        <div className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
          <h3 className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
            File Conversion
          </h3>
          <p className="text-gray-300">Convert files between popular formats like PNG ↔ JPG, PDF ↔ Word, MP4 ↔ MP3.</p>
        </div>
        <div className="bg-emerald-500/10 p-6 rounded-2xl shadow-[0_0_10px_rgba(16,185,129,0.1)] border border-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition">
          <h3 className="text-2xl font-bold mb-3 text-emerald-400 drop-shadow-[0_0_4px_rgba(16,185,129,0.5)]">
            Secure & Private
          </h3>
          <p className="text-gray-300">Your files are deleted automatically after processing. No retention.</p>
        </div>
      </section>
    </>
  );
}
