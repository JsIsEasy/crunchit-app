import { TOOLS, type ConversionMode } from "@/components/conversion-studio/types";

export const TOOL_PAGES = [
  {
    mode: "png",
    slug: "jpg-to-png",
    title: TOOLS.png.title,
    description: "Convert JPG or JPEG images to PNG in your browser. Add up to 10 files and download each image at its original dimensions.",
    tip: "PNG is useful when your next editor or publishing tool requires a lossless format. Saving a JPG as PNG avoids another round of JPEG compression.",
  },
  {
    mode: "jpeg",
    slug: "png-to-jpg",
    title: TOOLS.jpeg.title,
    description: "Convert PNG images to JPG in your browser. Add up to 10 files and download JPEGs ready to share.",
    tip: "JPG is useful for photographs and services that require JPEG uploads. Transparent areas become white, and JPEG compression may slightly change fine details.",
  },
] as const satisfies readonly {
  mode: ConversionMode;
  slug: string;
  title: string;
  description: string;
  tip: string;
}[];
