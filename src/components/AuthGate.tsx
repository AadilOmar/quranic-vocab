"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { applyFont, getFontCookie, FONTS, DEFAULT_FONT } from "@/hooks/useSettings";
import BottomNav from "@/components/BottomNav";


export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    const cached = getFontCookie();
    if (cached) applyFont(cached);
  }, []);

  if (pathname === "/privacy" || pathname === "/about" || pathname === "/login") return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FAFAF7]">
        {/* Hero */}
        <div className="flex flex-col items-center text-center px-6 pt-16 pb-12">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 flex items-center justify-center mb-4 shadow-md">
            <span className="font-arabic text-white text-3xl leading-none">ق</span>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 leading-tight">Quran Vocabulary</h1>
          <p className="text-stone-500 mt-3 max-w-xs leading-relaxed">
            Build a deeper connection with the Quran - one word at a time.
          </p>
          <Link
            href="/login"
            className="mt-6 px-8 py-3 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-colors shadow-sm"
          >
            Start Learning
          </Link>
        </div>

        {/* Features */}
        <div className="px-5 pb-12 max-w-sm mx-auto space-y-4">

          {/* Feature 1 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">Read</p>
              <h2 className="text-base font-bold text-stone-800">Tap any word while reading</h2>
              <p className="text-sm text-stone-400 mt-1 leading-relaxed">Read with translation. Tap any word to see its meaning, root, and number of occurrences.</p>
            </div>
            {/* Mock UI */}
            <div className="mx-5 mb-5 bg-stone-50 rounded-xl px-4 py-4">
              <p className="font-arabic text-right text-2xl text-stone-800 leading-loose mb-3">
                <span className="bg-amber-100 rounded px-1">بِسْمِ</span> اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
              </p>
              <div className="border-t border-stone-200 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-400 uppercase tracking-widest">Meaning</span>
                  <span className="text-sm text-stone-700 font-medium">In the name of</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-stone-400 uppercase tracking-widest">Root</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-400">381 occurrences</span>
                    <span className="font-arabic text-lg leading-none text-stone-700 relative -top-1">س م و</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">Save</p>
              <h2 className="text-base font-bold text-stone-800">Build your own word lists</h2>
              <p className="text-sm text-stone-400 mt-1 leading-relaxed">Save words to custom lists as you read - curated by you, for you.</p>
            </div>
            {/* Mock UI */}
            <div className="mx-5 mb-5 space-y-2">
              {[
                { name: "Al-Fatiha", count: 12, known: 8 },
                { name: "Juz Amma", count: 34, known: 20 },
                { name: "Common verbs", count: 18, known: 5 },
              ].map((list) => (
                <div key={list.name} className="flex items-center justify-between px-4 py-3 bg-stone-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{list.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">{list.count} words · <span className="text-green-500">{list.known} known</span></p>
                  </div>
                  <span className="text-stone-300 text-xs">›</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3">
              <p className="text-xs uppercase tracking-widest text-amber-500 font-semibold mb-1">Practice</p>
              <h2 className="text-base font-bold text-stone-800">Test yourself with flashcards</h2>
              <p className="text-sm text-stone-400 mt-1 leading-relaxed">Test your saved lists with swipeable flashcards. Track what you know and what still needs work.</p>
            </div>
            {/* Mock UI */}
            <div className="mx-5 mb-5 bg-stone-50 rounded-xl px-5 py-5">
              <div className="text-center mb-4">
                <p className="font-arabic text-5xl text-stone-800 leading-tight mb-2">الرَّحْمَٰنِ</p>
                <p className="text-base font-medium text-stone-700">The Most Merciful</p>
                <p className="text-sm text-stone-400">ar-raḥmāni</p>
              </div>
              <div className="flex gap-2 mt-3">
                <div className="flex-1 py-2 rounded-lg bg-amber-100 text-amber-700 text-xs font-semibold text-center">Still Learning</div>
                <div className="flex-1 py-2 rounded-lg bg-green-100 text-green-700 text-xs font-semibold text-center">Know It</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pb-12 flex justify-center gap-4">
          <Link href="/about" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">About</Link>
          <Link href="/privacy" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-16">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
