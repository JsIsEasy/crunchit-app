import { Footer, Header } from "@components";
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
