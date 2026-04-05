"use client";

import { Ayah, Word } from "@/types";
import ArabicWord from "./ArabicWord";

type Props = {
  ayah: Ayah;
  selectedWordId: string | null;
  savedLemmas: Set<string>;
  onWordTap: (word: Word) => void;
};

export default function VerseRow({ ayah, selectedWordId, savedLemmas, onWordTap }: Props) {
  return (
    <div className="py-5 border-b border-stone-200 last:border-0">
      <div dir="rtl" className="flex flex-wrap justify-end mb-3">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-amber-300 text-amber-700 text-sm font-semibold mx-2 self-center shrink-0">
          {ayah.id}
        </span>
        {ayah.words.map((word) => (
          <ArabicWord
            key={word.id}
            word={word}
            isSelected={selectedWordId === word.id}
            isSaved={savedLemmas.has(word.lemma)}
            onTap={onWordTap}
          />
        ))}
      </div>

      <p className="text-sm text-stone-500 leading-relaxed text-left">
        {ayah.translation}
      </p>
    </div>
  );
}
