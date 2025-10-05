import { Footer, Header } from "@ui";
import { customMetaData } from "./metadata";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  ...customMetaData, // So that I could override some content from this root layout.
  title: {
    template: "%s | Crunch it",
    default: "Crunch it",
  },
  description: "your one stop app for image conversion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`overscroll-y-none overscroll-none min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex flex-col items-center text-white p-6 dark`}
      >
        {/* Header */}
        <Header />
        {children}
        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
