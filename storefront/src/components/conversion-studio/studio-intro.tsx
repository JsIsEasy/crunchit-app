import React from "react";

export function Hero() {
  return (
    <section className="flex items-end justify-between gap-7 pb-8 pt-9 sm:pt-[54px]">
      <div>
        <p className="mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-[#4af0b5] before:h-px before:w-6 before:bg-[#4af0b5]">
          SMALL TOOLS. LESS FRICTION.
        </p>
        <h1 className="font-display text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.1] tracking-[-0.05em] text-[#edf6f5]">
          Your files.
          <br />A little more <span className="text-[#4af0b5]">flexible.</span>
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#8b9da8]">
          The right format. Without the runaround.
          <br />
          Drop your files, crunch them, and get back to creating.
        </p>
      </div>
      <p className="hidden max-w-[195px] pb-1 text-xs leading-5 text-[#8b9da8] md:block">
        <strong className="font-medium text-[#d9e5e5]">Built for the next thing.</strong>
        <br />
        From that one image to a whole batch. One simple workspace.
      </p>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["01", "Pick your format", "A tool for the job. No settings you don’t need."],
    ["02", "Drop. Crunch. Done.", "Add a batch and follow each file independently."],
    ["03", "Take it from here", "Download your converted images, ready to use."],
  ];
  return (
    <section id="how" className="my-7 grid gap-5 sm:my-8 sm:grid-cols-3 sm:gap-10">
      {steps.map(([number, title, description]) => (
        <div key={number} className="flex gap-3">
          <span className="grid size-[25px] shrink-0 place-items-center rounded-full border border-[#4af0b5]/20 font-display text-[11px] text-[#4af0b5]">
            {number}
          </span>
          <div>
            <strong className="text-[11px] font-medium text-[#edf6f5]">{title}</strong>
            <p className="mt-1 text-[10px] leading-[1.7] text-[#6c8993]">{description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
