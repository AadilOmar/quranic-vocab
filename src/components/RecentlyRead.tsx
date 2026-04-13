"use client";

import Link from "next/link";
import { useReadingHistory } from "@/hooks/useReadingHistory";

export default function RecentlyRead() {
  const { history } = useReadingHistory();

  if (history.length === 0) return null;

  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-widest text-stone-400 mb-3">Continue Reading</p>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {history.map((entry) => (
          <Link
            key={entry.surahId}
            href={`/surah/${entry.surahId}`}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-full border border-stone-100 shadow-sm hover:border-amber-200 transition-all shrink-0"
          >
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 shrink-0">
              {entry.surahId}
            </span>
            <span className="text-sm font-medium text-stone-800">{entry.surahName}</span>
            <span className="text-xs text-stone-400">{entry.lastVerse}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
