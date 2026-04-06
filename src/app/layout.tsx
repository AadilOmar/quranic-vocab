import type { Metadata } from "next";
import { Amiri } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Quran Vocabulary",
  description: "Read the Quran and learn vocabulary word by word",
  other: {
    "google": "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" translate="no" className={`${amiri.variable} h-full`}>
      <body className="min-h-full bg-[#FAFAF7] text-stone-800">{children}</body>
    </html>
  );
}
