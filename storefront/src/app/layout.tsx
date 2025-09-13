import { Footer, Header } from "@ui";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Crunch it",
  description: "your one stop app for image conversion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`overscroll-y-none overscroll-none min-h-screen bg-gradient-to-br from-black via-gray-900 to-emerald-950 flex flex-col items-center text-white p-6`}
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
