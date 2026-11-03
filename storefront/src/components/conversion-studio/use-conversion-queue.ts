"use client";

import { useEffect, useRef, useState } from "react";
import { convertImage, createSamples } from "./browser-converter";
import { ConversionMode, getOutputFilename, MAX_FILES, MAX_FILE_SIZE_BYTES, QueueItem, TOOLS } from "./types";

const CONCURRENCY = 2;

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not convert image.";
}

export function useConversionQueue() {
  const [mode, setMode] = useState<ConversionMode>("png");
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notice, setNotice] = useState("");
  const [toast, setToast] = useState("");
  const itemsRef = useRef<QueueItem[]>([]);
  const busyRef = useRef(false);
  const mountedRef = useRef(true);
  const ownedUrls = useRef(new Set<string>());
  const downloadTimers = useRef(new Set<number>());

  useEffect(() => {
    mountedRef.current = true;
    const urls = ownedUrls.current;
    const timers = downloadTimers.current;

    return () => {
      mountedRef.current = false;
      urls.forEach((url) => URL.revokeObjectURL(url));
      urls.clear();
      timers.forEach((timer) => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function replaceItems(nextItems: QueueItem[]) {
    itemsRef.current = nextItems;
    setItems(nextItems);
  }

  function updateItem(id: string, changes: Partial<QueueItem>) {
    replaceItems(itemsRef.current.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }

  function createUrl(blob: Blob) {
    const url = URL.createObjectURL(blob);
    ownedUrls.current.add(url);
    return url;
  }

  function releaseItem(item: QueueItem) {
    for (const url of [item.previewUrl, item.outputUrl]) {
      if (url) {
        URL.revokeObjectURL(url);
        ownedUrls.current.delete(url);
      }
    }
  }

  function appendFiles(files: File[]) {
    const errors: string[] = [];
    const additions: QueueItem[] = [];
    const tool = TOOLS[mode];

    for (const file of files) {
      if (itemsRef.current.length + additions.length >= MAX_FILES) {
        errors.push("You can add up to 10 files. Remove some to add more.");
        break;
      }
      if (file.type !== tool.mimeType) {
        errors.push(`${file.name}: choose ${tool.input} images for this tool.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        errors.push(`${file.name}: exceeds the 10 MB limit.`);
        continue;
      }

      additions.push({
        id: crypto.randomUUID(),
        file,
        previewUrl: createUrl(file),
        status: "queued",
      });
    }

    setNotice(errors.join(" "));
    replaceItems([...itemsRef.current, ...additions]);
  }

  function addFiles(files: File[]) {
    if (!busyRef.current) appendFiles(files);
  }

  function removeItem(id: string) {
    if (busyRef.current) return;
    const item = itemsRef.current.find((entry) => entry.id === id);
    if (item) releaseItem(item);
    replaceItems(itemsRef.current.filter((entry) => entry.id !== id));
  }

  function switchTool(nextMode: ConversionMode) {
    if (busyRef.current || nextMode === mode) return;
    if (itemsRef.current.length && !window.confirm("Switch conversion tools? This clears the current file list."))
      return;

    itemsRef.current.forEach(releaseItem);
    replaceItems([]);
    setNotice("");
    setToast("");
    setMode(nextMode);
  }

  async function processItem(item: QueueItem) {
    updateItem(item.id, { status: "processing" });

    try {
      const output = await convertImage(item.file, mode);
      if (!mountedRef.current) return;
      updateItem(item.id, {
        output,
        outputUrl: createUrl(output),
        status: "ready",
      });
    } catch (error) {
      if (!mountedRef.current) return;
      updateItem(item.id, { status: "failed", error: errorMessage(error) });
    }
  }

  function download(item: QueueItem) {
    if (!item.outputUrl) return;
    const link = document.createElement("a");
    link.href = item.outputUrl;
    link.download = getOutputFilename(item.file.name, mode);
    link.click();
  }

  function downloadAll() {
    itemsRef.current
      .filter((item) => item.status === "ready")
      .forEach((item, index) => {
        const timer = window.setTimeout(() => {
          downloadTimers.current.delete(timer);
          if (ownedUrls.current.has(item.outputUrl ?? "")) download(item);
        }, index * 300);
        downloadTimers.current.add(timer);
      });
  }

  async function crunchFiles() {
    if (busyRef.current) return;
    const queued = itemsRef.current.filter((item) => item.status === "queued");
    if (!queued.length) {
      downloadAll();
      return;
    }

    busyRef.current = true;
    setIsProcessing(true);
    setNotice("");

    try {
      for (let index = 0; index < queued.length; index += CONCURRENCY) {
        if (!mountedRef.current) return;
        await Promise.all(queued.slice(index, index + CONCURRENCY).map(processItem));
      }

      if (mountedRef.current) {
        const completed = itemsRef.current.filter((item) => item.status === "ready").length;
        const failed = itemsRef.current.filter((item) => item.status === "failed").length;
        setToast(`Batch finished. ${completed} ready${failed ? `, ${failed} failed` : ""}.`);
      }
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setIsProcessing(false);
    }
  }

  function clearCompleted() {
    if (busyRef.current) return;
    itemsRef.current.filter((item) => item.status === "ready").forEach(releaseItem);
    replaceItems(itemsRef.current.filter((item) => item.status !== "ready"));
  }

  async function addSamples() {
    if (busyRef.current) return;
    busyRef.current = true;
    setIsProcessing(true);

    try {
      const samples = await createSamples(mode);
      if (mountedRef.current) appendFiles(samples);
    } catch (error) {
      if (mountedRef.current) setNotice(errorMessage(error));
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setIsProcessing(false);
    }
  }

  return {
    mode,
    items,
    isProcessing,
    notice,
    toast,
    tool: TOOLS[mode],
    queuedCount: items.filter((item) => item.status === "queued").length,
    readyCount: items.filter((item) => item.status === "ready").length,
    addFiles,
    removeItem,
    switchTool,
    download,
    crunchFiles,
    clearCompleted,
    addSamples,
  };
}
