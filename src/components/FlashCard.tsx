"use client";

import { useState, useEffect, useRef } from "react";
import { ListItem } from "@/hooks/useLists";
import { parseSourceWordId } from "@/data/index";

type SourceVerse = {
  surahId: number;
  surahName: string;
  ayahId: number;
  words: string[];
  highlightIndex: number;
  translation: string;
  prevArabic?: string;
  prevTranslation?: string;
};

type Props = {
  item: ListItem;
  index: number;
  total: number;
  flipped: boolean;
  font: string;
  direction: "left" | "right";
  liveStatus?: string;
  onFlip: () => void;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
};

const INDOPAK_FONTS = new Set(["noorehidayat", "noorehira", "noorehuda"]);

async function fetchSourceVerse(sourceWordId: string, fontId: string): Promise<SourceVerse | null> {
  const parsed = parseSourceWordId(sourceWordId);
  if (!parsed) return null;

  const wordPosition = parseInt(sourceWordId.split(":")[2] ?? "1");

  const isIndopak = INDOPAK_FONTS.has(fontId);
  const wordTextField = isIndopak ? "text_indopak" : "text_uthmani";

  try {
    const [wordsRes, translationRes, chapterRes] = await Promise.all([
      fetch(
        `https://api.quran.com/api/v4/verses/by_key/${parsed.surahId}:${parsed.ayahId}` +
          `?words=true&word_fields=${wordTextField}`
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
      .map((w: { text_uthmani?: string; text_indopak?: string }) =>
        ((isIndopak ? w.text_indopak : w.text_uthmani) ?? "").trim()
      );

    let words: string[];
    let highlightIndex: number;
    if (allWords.length <= 60) {
      words = allWords;
      highlightIndex = wordPosition - 1;
    } else {
      const idx = wordPosition - 1;
      let start = Math.max(0, idx - 29);
      let end = Math.min(allWords.length - 1, start + 59);
      start = Math.max(0, end - 59);
      words = allWords.slice(start, end + 1);
      highlightIndex = idx - start;
      if (start > 0) words = ["…", ...words];
      if (end < allWords.length - 1) words = [...words, "…"];
      if (start > 0) highlightIndex += 1; // offset for leading ellipsis
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

    let prevArabic: string | undefined;
    let prevTranslation: string | undefined;
    if (allWords.length < 6 && parsed.ayahId > 1) {
      const [prevWordsRes, prevTranslationRes] = await Promise.all([
        fetch(
          `https://api.quran.com/api/v4/verses/by_key/${parsed.surahId}:${parsed.ayahId - 1}` +
            `?words=true&word_fields=text_uthmani`
        ),
        fetch(`https://api.alquran.cloud/v1/ayah/${parsed.surahId}:${parsed.ayahId - 1}/en.sahih`),
      ]);
      if (prevWordsRes.ok) {
        const prevWordsData = await prevWordsRes.json();
        const prevWords: string[] = prevWordsData.verse.words
          .filter((w: { char_type_name: string }) => w.char_type_name === "word")
          .map((w: { text_uthmani: string }) => w.text_uthmani);
        if (prevWords.length > 8) {
          prevArabic = "…" + prevWords.slice(-5).join(" ");
        } else {
          prevArabic = prevWords.join(" ");
        }
      }
      if (prevTranslationRes.ok) {
        const prevTranslationData = await prevTranslationRes.json();
        prevTranslation = prevTranslationData.data?.text ?? undefined;
      }
    }

    return { surahId: parsed.surahId, surahName, ayahId: parsed.ayahId, words, highlightIndex, translation, prevArabic, prevTranslation };
  } catch {
    return null;
  }
}

export default function FlashCard({ item, index, total, flipped, font, direction, liveStatus, onFlip, onSwipeLeft, onSwipeRight }: Props) {
  const [sourceVerse, setSourceVerse] = useState<SourceVerse | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    setSourceVerse(null);
    fetchSourceVerse(item.sourceWordId, font).then(setSourceVerse);
  }, [item.sourceWordId, font]);

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
    <div className={`flex flex-col w-full ${direction === "right" ? "slide-in-right" : "slide-in-left"}`}>
      {/* Flip card container */}
      <div
        onClick={onFlip}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full cursor-pointer select-none"
        style={{ perspective: "1000px" }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            transition: "transform 0.4s ease",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            position: "relative",
            height: "224px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border border-stone-100 shadow-md flex items-center justify-center px-6"
            style={{ backfaceVisibility: "hidden" }}
          >
            {(liveStatus ?? item.status) === "known" && (
              <span className="absolute top-3 right-3 text-xs text-green-500 uppercase tracking-widest">✓ Known</span>
            )}
            <p className="font-arabic text-5xl text-stone-800 leading-tight">{item.arabic}</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 bg-white rounded-2xl border border-stone-100 shadow-md flex items-center justify-center px-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <p className="text-3xl font-semibold text-stone-700 text-center">{item.meaning}</p>
          </div>
        </div>
      </div>

      {/* Verse context — below card, only when flipped */}
      {flipped && sourceVerse && (
        <div className="mt-3">
          <div className="bg-amber-50 rounded-xl px-4 py-3">
            <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">
              {sourceVerse.surahName} {sourceVerse.surahId}:{sourceVerse.ayahId}
            </p>
            {sourceVerse.prevArabic && (
              <p dir="rtl" className="font-arabic text-base text-stone-400 leading-loose mb-1 text-right">
                {sourceVerse.prevArabic}
              </p>
            )}
            <p dir="rtl" className="font-arabic text-lg text-stone-700 leading-loose mb-2 text-right">
              {sourceVerse.words.map((token, i) => (
                <span key={i}>
                  {i > 0 && " "}
                  {i === sourceVerse.highlightIndex
                    ? <span className="bg-amber-200 text-amber-900 rounded px-0.5 font-bold">{token}</span>
                    : token}
                </span>
              ))}
            </p>
            {sourceVerse.prevTranslation && (
              <p className="text-xs text-stone-400 leading-relaxed mb-1 italic">{sourceVerse.prevTranslation}</p>
            )}
            <p className="text-xs text-stone-500 leading-relaxed">{sourceVerse.translation}</p>
          </div>
        </div>
      )}
    </div>
  );
}
