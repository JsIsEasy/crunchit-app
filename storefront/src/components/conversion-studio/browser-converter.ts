import { ConversionMode, MAX_IMAGE_PIXELS } from "./types";

function encodeCanvas(canvas: HTMLCanvasElement, mimeType: string) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not encode image."));
      },
      mimeType,
      0.92,
    );
  });
}

export async function convertImage(file: File, mode: ConversionMode) {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");

  try {
    if (bitmap.width * bitmap.height > MAX_IMAGE_PIXELS) {
      throw new Error("Image dimensions exceed the 40 megapixel limit.");
    }

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Could not prepare image conversion.");

    if (mode === "jpeg") {
      context.fillStyle = "white";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.drawImage(bitmap, 0, 0);
    return await encodeCanvas(canvas, `image/${mode}`);
  } finally {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
  }
}

export async function createSamples(mode: ConversionMode) {
  const samples = [
    { name: "weekend-escape", colors: ["#153e40", "#f4d9a5"] },
    { name: "studio-notes", colors: ["#313d65", "#c8bbf1"] },
    { name: "morning-light", colors: ["#4e6c54", "#d6e3af"] },
  ];

  return Promise.all(
    samples.map(async ({ name, colors }) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1000;
      canvas.height = 650;
      try {
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not create sample image.");

        const gradient = context.createLinearGradient(0, 0, 1000, 650);
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(1, colors[1]);
        context.fillStyle = gradient;
        context.fillRect(0, 0, 1000, 650);
        context.fillStyle = "#ffffff30";
        context.beginPath();
        context.arc(720, 240, 160, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = "#fff";
        context.font = "50px sans-serif";
        context.fillText(name.replaceAll("-", " "), 70, 540);

        const mimeType = mode === "png" ? "image/jpeg" : "image/png";
        const blob = await encodeCanvas(canvas, mimeType);
        const extension = mode === "png" ? "jpg" : "png";
        return new File([blob], `${name}.${extension}`, { type: mimeType });
      } finally {
        canvas.width = 0;
        canvas.height = 0;
      }
    }),
  );
}
