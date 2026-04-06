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
  knownCount: number;
  flipped: boolean;
  onFlip: () => void;
};

async function fetchSourceVerse(sourceWordId: string): Promise<SourceVerse | null> {
  const parsed = parseSourceWordId(sourceWordId);
  if (!parsed) return null;

  const wordPosition = parseInt(sourceWordId.split(":")[2] ?? "1");

  try {
    const [wordsRes, translationRes] = await Promise.all([
      fetch(
        `https://api.quran.com/api/v4/verses/by_key/${parsed.surahId}:${parsed.ayahId}` +
          `?words=true&word_fields=text_uthmani`
      ),
      fetch(
        `https://api.alquran.cloud/v1/ayah/${parsed.surahId}:${parsed.ayahId}/en.sahih`
      ),
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

    return { surahId: parsed.surahId, ayahId: parsed.ayahId, arabic, translation };
  } catch {
    return null;
  }
}

export default function FlashCard({ item, index, total, knownCount, flipped, onFlip }: Props) {
  const [sourceVerse, setSourceVerse] = useState<SourceVerse | null>(null);

  useEffect(() => {
    setSourceVerse(null);
    fetchSourceVerse(item.sourceWordId).then(setSourceVerse);
  }, [item.sourceWordId]);

  return (
    <div className="flex flex-col w-full">
      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between text-xs text-stone-400 mb-1.5">
          <span>{total} remaining · {knownCount} known</span>
          <span>{flipped ? "tap to flip back" : "tap to reveal"}</span>
        </div>
        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${total > 0 ? (knownCount / total) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={onFlip}
        className="w-full bg-white rounded-2xl border border-stone-100 shadow-md cursor-pointer select-none transition-all duration-200 active:scale-[0.98]"
      >
        {!flipped ? (
          <div className="relative flex flex-col items-center justify-center h-56 px-6">
            {item.status === "known" && (
              <span className="absolute top-3 right-3 text-xs text-green-500 uppercase tracking-widest">✓ Known</span>
            )}
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
    </div>
  );
}
