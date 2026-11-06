import type { Metadata } from "next";
import { ConversionStudio } from "@/components/conversion-studio";
import { SITE_URL } from "@/lib/site";
import React from "react";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "CrunchIt",
  url: SITE_URL,
};

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(website)}</script>
      <ConversionStudio />
    </>
  );
}
