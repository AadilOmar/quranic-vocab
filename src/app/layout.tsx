import type { Metadata } from "next";
import { Amiri, Scheherazade_New, Noto_Naskh_Arabic, Noto_Nastaliq_Urdu, Gulzar } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";
import AuthGate from "@/components/AuthGate";

const amiri = Amiri({
  variable: "--font-amiri",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const scheherazade = Scheherazade_New({
  variable: "--font-scheherazade",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const notoNastaliq = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq",
  subsets: ["arabic"],
  weight: ["400", "700"],
});

const gulzar = Gulzar({
  variable: "--font-gulzar",
  subsets: ["arabic"],
  weight: ["400"],
});

const noorehidayat = localFont({
  src: "./fonts/noorehidayat.ttf",
  variable: "--font-noorehidayat",
});

const noorehira = localFont({
  src: "./fonts/noorehira.ttf",
  variable: "--font-noorehira",
});

const noorehuda = localFont({
  src: "./fonts/noorehuda.ttf",
  variable: "--font-noorehuda",
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
    <html lang="en" translate="no" className={`${amiri.variable} ${scheherazade.variable} ${notoNaskh.variable} ${notoNastaliq.variable} ${gulzar.variable} ${noorehidayat.variable} ${noorehira.variable} ${noorehuda.variable} h-full`}>
      <body className="min-h-full bg-[#FAFAF7] text-stone-800">
        <AuthGate>{children}</AuthGate>
        <footer className="pb-20 pt-0 text-center">
          <Link href="/privacy" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">
            Privacy Policy
          </Link>
        </footer>
      </body>
    </html>
  );
}
