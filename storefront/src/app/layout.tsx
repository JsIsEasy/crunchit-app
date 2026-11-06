import type { Metadata } from "next";
import React from "react";
import { Header } from "@/components/ui/header";
import { Footer } from "@/components/ui/footer";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { template: "%s | CrunchIt", default: "CrunchIt Image Converter" },
  description: "Convert JPG to PNG or PNG to JPG with CrunchIt. Convert up to 10 images at a time in your browser.",
  icons: {
    icon: { url: "/brand/app-icon-192.png", sizes: "192x192", type: "image/png" },
    apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
