import Link from "next/link";
import React from "react";
import { TOOL_PAGES } from "@/lib/tool-pages";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] flex-wrap items-center justify-between gap-4 border-t border-white/[.075] px-5 py-5 text-[10px] text-[#8b9da8] sm:px-8">
      <span>
        © {new Date().getFullYear()} CrunchIt. Less friction, more creating.
      </span>
      <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {TOOL_PAGES.map(({ slug, title }) => (
          <Link key={slug} href={`/${slug}`} className="hover:text-[#4af0b5] hover:underline">
            {title}
          </Link>
        ))}
        <Link href="/about" className="hover:text-[#4af0b5] hover:underline">About CrunchIt</Link>
      </nav>
      <span>
        Built with care in India <span className="text-[#4af0b5]">↗</span>
      </span>
    </footer>
  );
}
