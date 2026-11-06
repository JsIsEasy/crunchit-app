import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ConversionStudio } from "@/components/conversion-studio";
import { TOOL_PAGES } from "@/lib/tool-pages";

type ToolPageProps = { params: Promise<{ tool: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return TOOL_PAGES.map(({ slug }) => ({ tool: slug }));
}

async function getToolPage(params: ToolPageProps["params"]) {
  const { tool } = await params;
  return TOOL_PAGES.find(({ slug }) => slug === tool) ?? notFound();
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = await getToolPage(params);
  return {
    title: `${tool.title} Converter`,
    description: tool.description,
    alternates: { canonical: `/${tool.slug}` },
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const tool = await getToolPage(params);

  return (
    <ConversionStudio key={tool.slug} mode={tool.mode}>
      <section className="py-9 sm:pt-[54px]">
        <h1 className="font-display text-4xl font-medium tracking-tight text-[#edf6f5]">
          {tool.title} Converter
        </h1>
        <p className="mt-4 max-w-2xl leading-7 text-[#8b9da8]">{tool.description}</p>
        <p className="mt-2 max-w-2xl leading-7 text-[#8b9da8]">{tool.tip}</p>
      </section>
    </ConversionStudio>
  );
}
