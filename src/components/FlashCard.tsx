"use client";

import { useState, useEffect, useRef } from "react";
import { ListItem } from "@/hooks/useLists";
import { parseSourceWordId } from "@/data/index";

type SourceVerse = {
  surahId: number;
  surahName: string;
  ayahId: number;
  arabic: string;
  translation: string;
};

type Props = {
  item: ListItem;
  index: number;
  total: number;
  flipped: boolean;
  onFlip: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

async function fetchSourceVerse(sourceWordId: string): Promise<SourceVerse | null> {
  const parsed = parseSourceWordId(sourceWordId);
  if (!parsed) return null;

  const wordPosition = parseInt(sourceWordId.split(":")[2] ?? "1");

  try {
    const [wordsRes, translationRes, chapterRes] = await Promise.all([
      fetch(
        `https://api.quran.com/api/v4/verses/by_key/${parsed.surahId}:${parsed.ayahId}` +
          `?words=true&word_fields=text_uthmani`
      ),
      fetch(
        `https://api.alquran.cloud/v1/ayah/${parsed.surahId}:${parsed.ayahId}/en.sahih`
      ),
      fetch(`https://api.quran.com/api/v4/chapters/${parsed.surahId}?language=en`),
    ]);

    if (!wordsRes.ok) return null;
    const wordsData = await wordsRes.json();

    const allWords: string[] = wordsData.verse.words
      .filter((w: { char_type_name: string }) => w.char_type_name === "word")
      .map((w: { text_uthmani: string }) => w.text_uthmani);

    let arabic: string;
    if (allWords.length <= 60) {
      arabic = allWords.join(" ");
    } else {
      const idx = wordPosition - 1;
      let start = Math.max(0, idx - 29);
      let end = Math.min(allWords.length - 1, start + 59);
      start = Math.max(0, end - 59);
      arabic = allWords.slice(start, end + 1).join(" ");
      if (start > 0) arabic = "…" + arabic;
      if (end < allWords.length - 1) arabic = arabic + "…";
    }

    let translation = "";
    if (translationRes.ok) {
      const translationData = await translationRes.json();
      translation = translationData.data?.text ?? "";
    }

    let surahName = `Surah ${parsed.surahId}`;
    if (chapterRes.ok) {
      const chapterData = await chapterRes.json();
      surahName = chapterData.chapter?.name_simple ?? surahName;
    }

    return { surahId: parsed.surahId, surahName, ayahId: parsed.ayahId, arabic, translation };
  } catch {
    return null;
  }
}

export default function FlashCard({ item, index, total, flipped, onFlip, onSwipeLeft, onSwipeRight }: Props) {
  const [sourceVerse, setSourceVerse] = useState<SourceVerse | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSourceVerse(null);
    fetchSourceVerse(item.sourceWordId).then(setSourceVerse);
  }, [item.sourceWordId]);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
    e.preventDefault();
    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  };

  return (
    <div className="flex flex-col w-full">
      {/* Card */}
      <div
        onClick={onFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full bg-white rounded-2xl border border-stone-100 shadow-md cursor-pointer select-none transition-all duration-200 active:scale-[0.98]"
      >
        {!flipped ? (
          <div className="relative flex items-center justify-center h-56 px-6">
            {item.status === "known" && (
              <span className="absolute top-3 right-3 text-xs text-green-500 uppercase tracking-widest">✓ Known</span>
            )}
            <p className="font-arabic text-5xl text-stone-800 leading-tight">{item.arabic}</p>
          </div>
        ) : (
          <div className="flex flex-col px-6 pb-6">
            {/* Meaning — same height as Arabic front */}
            <div className="flex items-center justify-center h-56 text-center px-2">
              <p className="text-3xl font-semibold text-stone-700">{item.meaning}</p>
            </div>

            {sourceVerse && (
              <>
                <div className="bg-amber-50 rounded-xl px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">
                    {sourceVerse.surahName} {sourceVerse.surahId}:{sourceVerse.ayahId}
                  </p>
                  <p dir="rtl" className="font-arabic text-lg text-stone-700 leading-loose mb-2 text-right">
                    {sourceVerse.arabic.split(" ").map((token, i) => {
                      const strip = (s: string) => s.replace(/[\u0610-\u061A\u064B-\u065F]/g, "");
                      const isMatch = strip(token) === strip(item.arabic);
                      return (
                        <span key={i}>
                          {i > 0 && " "}
                          {isMatch
                            ? <span className="bg-amber-200 text-amber-900 rounded px-0.5 font-bold">{token}</span>
                            : token}
                        </span>
                      );
                    })}
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">{sourceVerse.translation}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
