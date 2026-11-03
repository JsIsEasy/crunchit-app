import Link from "next/link";
import React from "react";
import { Logo } from "./logo";

export function Header() {
  return (
    <header className="border-b border-white/[.075]">
      <div className="mx-auto flex h-[65px] w-full max-w-[1200px] items-center justify-between px-5 sm:h-[85px] sm:px-8">
        <Link
          href="/"
          aria-label="CrunchIt home"
          className="inline-flex items-center"
        >
          <Logo />
        </Link>
        <nav
          aria-label="Main navigation"
          className="flex items-center gap-4 text-[11px] text-[#b4c2c8] sm:gap-7 sm:text-[13px]"
        >
          <Link href="/#how" className="transition hover:text-[#4af0b5]">
            How it works
          </Link>
          <span className="hidden rounded-full border border-white/[.075] px-3 py-2 text-[11px] text-[#8b9da8] sm:inline">
            <span className="mr-2 inline-block size-1.5 rounded-full bg-[#4af0b5] shadow-[0_0_10px_rgba(74,240,181,.25)]" />
            No account needed
          </span>
        </nav>
      </div>
    </header>
  );
}
