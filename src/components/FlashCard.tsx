"use client";

import { useState, useEffect } from "react";
import { ListItem } from "@/hooks/useLists";
import { parseSourceWordId } from "@/data/index";

type SourceVerse = {
  surahId: number;
  ayahId: number;
  arabic: string;
  translation: string;
};

type Props = {
  item: ListItem;
  index: number;
  total: number;
  onNext: () => void;
  onPrev: () => void;
};

async function fetchSourceVerse(sourceWordId: string): Promise<SourceVerse | null> {
  const parsed = parseSourceWordId(sourceWordId);
  if (!parsed) return null;

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/verses/by_key/${parsed.surahId}:${parsed.ayahId}` +
        `?words=true&word_fields=text_uthmani&translations=131`
    );
    if (!res.ok) return null;
    const data = await res.json();
    const verse = data.verse;

    const arabic = verse.words
      .filter((w: { char_type_name: string }) => w.char_type_name === "word")
      .map((w: { text_uthmani: string }) => w.text_uthmani)
      .join(" ");

    const translation = verse.translations?.[0]?.text ?? "";
    return { surahId: parsed.surahId, ayahId: parsed.ayahId, arabic, translation };
  } catch {
    return null;
  }
}

export default function FlashCard({ item, index, total, onNext, onPrev }: Props) {
  const [flipped, setFlipped] = useState(false);
  const [sourceVerse, setSourceVerse] = useState<SourceVerse | null>(null);

  useEffect(() => {
    setSourceVerse(null);
    fetchSourceVerse(item.sourceWordId).then(setSourceVerse);
  }, [item.sourceWordId]);

  const handleNext = () => { setFlipped(false); setTimeout(onNext, 150); };
  const handlePrev = () => { setFlipped(false); setTimeout(onPrev, 150); };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Progress */}
      <div className="w-full max-w-sm mb-4">
        <div className="flex justify-between text-xs text-stone-400 mb-1.5">
          <span>{index + 1} of {total}</span>
          <span>{flipped ? "tap to flip back" : "tap to reveal"}</span>
        </div>
        <div className="w-full h-1 bg-stone-100 rounded-full">
          <div
            className="h-1 bg-amber-400 rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setFlipped((f) => !f)}
        className="w-full max-w-sm min-h-72 bg-white rounded-2xl border border-stone-100 shadow-md cursor-pointer select-none transition-all duration-200 active:scale-[0.98]"
      >
        {!flipped ? (
          <div className="flex flex-col items-center justify-center h-72 px-6">
            <p className="font-arabic text-6xl text-stone-800 mb-4 leading-tight">{item.arabic}</p>
            <p className="text-xs text-stone-300 uppercase tracking-widest">{item.lemma}</p>
          </div>
        ) : (
          <div className="flex flex-col px-6 py-6 gap-4">
            <div className="text-center">
              <p className="text-xl font-semibold text-stone-700">{item.meaning}</p>
            </div>

            <div className="border-t border-stone-100" />

            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Root</p>
                <p className="font-arabic text-xl text-stone-700">{item.root || "—"}</p>
              </div>
              <div className="w-px bg-stone-100" />
              <div className="text-center">
                <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">Lemma</p>
                <p className="font-arabic text-xl text-stone-700">{item.lemma || "—"}</p>
              </div>
            </div>

            {sourceVerse && (
              <>
                <div className="border-t border-stone-100" />
                <div className="bg-amber-50 rounded-xl px-4 py-3">
                  <p className="text-xs uppercase tracking-widest text-amber-600 mb-2">
                    Surah {sourceVerse.surahId}:{sourceVerse.ayahId}
                  </p>
                  <p dir="rtl" className="font-arabic text-lg text-stone-700 leading-loose mb-2 text-right">
                    {sourceVerse.arabic}
                  </p>
                  <p className="text-xs text-stone-500 leading-relaxed">{sourceVerse.translation}</p>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <div className="flex items-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={index === 0}
          className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium disabled:opacity-30 hover:border-stone-300 transition-colors"
        >
          ← Prev
        </button>
        <button
          onClick={() => setFlipped((f) => !f)}
          className="px-6 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          {flipped ? "Hide" : "Reveal"}
        </button>
        <button
          onClick={handleNext}
          disabled={index === total - 1}
          className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium disabled:opacity-30 hover:border-stone-300 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
