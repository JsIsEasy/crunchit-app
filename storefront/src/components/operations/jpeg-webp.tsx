import { useCrunchItStore } from "@/store";
import Base from "./base";

export default function JpegAndWebp({ reverse }: { reverse?: boolean }) {
  const direction = reverse ? "JPG ↔ WEBP" : "WEBP ↔ JPG";

  const [originalFormat, targetFormat] = reverse ? ["PNG", "WEBP"] : ["WEBP", "JPG"];

  const { initOperation } = useCrunchItStore((store) => store);

  return <Base onClick={() => initOperation({ originalFormat, targetFormat })}>{direction}</Base>;
}
