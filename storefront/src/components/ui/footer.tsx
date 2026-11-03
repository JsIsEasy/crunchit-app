import React from "react";

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-[1200px] justify-between gap-4 border-t border-white/[.075] px-5 py-5 text-[9px] text-[#58737b] sm:px-8 sm:text-[10px]">
      <span>
        © {new Date().getFullYear()} CrunchIt. Less friction, more creating.
      </span>
      <span>
        Built with care in India <span className="text-[#4af0b5]">↗</span>
      </span>
    </footer>
  );
}
