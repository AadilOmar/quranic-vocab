"use client";

import { Ayah, Word } from "@/types";
import ArabicWord from "./ArabicWord";

type Props = {
  ayah: Ayah;
  selectedWordId: string | null;
  savedLemmas: Set<string>;
  onWordTap: (word: Word) => void;
};

const toArabicNumeral = (n: number) =>
  n.toString().replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[parseInt(d)]);

export default function VerseRow({ ayah, selectedWordId, savedLemmas, onWordTap }: Props) {
  return (
    <div id={`verse-${ayah.id}`} className="relative py-5 border-b border-stone-200 last:border-0">
      <div dir="rtl" className="flex flex-wrap mb-2">
        {ayah.words.slice(0, -1).map((word) => (
          <ArabicWord
            key={word.id}
            word={word}
            isSelected={selectedWordId === word.id}
            isSaved={savedLemmas.has(word.lemma)}
            onTap={onWordTap}
          />
        ))}
        {ayah.words.length > 0 && (
          <span className="inline-flex items-center">
            <ArabicWord
              word={ayah.words[ayah.words.length - 1]}
              isSelected={selectedWordId === ayah.words[ayah.words.length - 1].id}
              isSaved={savedLemmas.has(ayah.words[ayah.words.length - 1].lemma)}
              onTap={onWordTap}
            />
            <span className="relative inline-flex items-center justify-center self-center mx-0.5 select-none pointer-events-none shrink-0">
              <span className="font-arabic text-black text-base leading-none">۝</span>
              <span className="absolute font-arabic text-black text-[10px] leading-none">{toArabicNumeral(ayah.id)}</span>
            </span>
          </span>
        )}
      </div>

      <p className="text-sm text-stone-500 leading-relaxed text-left">
        {ayah.translation}
      </p>
    </div>
  );
}
