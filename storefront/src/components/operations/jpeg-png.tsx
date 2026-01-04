import { useCrunchItStore } from "@/store";
import Base from "./base";

export default function JpegAndPng({ reverse }: { reverse?: boolean }) {
  const direction = reverse ? "PNG ↔ JPG" : "JPG ↔ PNG";
  
  const [originalFormat, targetFormat] = reverse ? ["PNG", "JPG"] : ["JPG", "PNG"];

  const { initOperation } = useCrunchItStore((store) => store);

  return <Base onClick={() => initOperation({ originalFormat, targetFormat })}>{direction}</Base>;
}
