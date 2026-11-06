import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { TOOL_PAGES } from "@/lib/tool-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/about", ...TOOL_PAGES.map(({ slug }) => `/${slug}`)].map(
    (path) => ({ url: new URL(path, SITE_URL).href }),
  );
}
