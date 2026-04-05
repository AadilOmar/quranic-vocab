"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Surah, Word } from "@/types";
import VerseRow from "./VerseRow";
import WordBottomSheet from "./WordBottomSheet";
import { useLists } from "@/hooks/useLists";

type Props = { surah: Surah };

export default function SurahReader({ surah }: Props) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const { lists, createList, addWordToList, isWordSaved } = useLists();

  const savedLemmas = useMemo(() => {
    const lemmas = new Set<string>();
    lists.forEach((list) => list.items.forEach((item) => lemmas.add(item.lemma)));
    return lemmas;
  }, [lists]);

  const handleWordTap = (word: Word) => {
    setSelectedWord((prev) => (prev?.id === word.id ? null : word));
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-[#FAFAF7] pt-4 pb-4 border-b border-stone-200 mb-2 z-10">
        <div className="flex items-center justify-between mb-3">
          <Link href="/" className="text-sm text-stone-400 hover:text-stone-600 transition-colors">
            ← Surahs
          </Link>
          <Link href="/lists" className="text-sm text-stone-400 hover:text-amber-600 transition-colors">
            My Lists →
          </Link>
        </div>
        <div className="text-center">
          <p className="text-xs uppercase tracking-widest text-stone-400 mb-1">
            Surah {surah.id}
          </p>
          <h1 className="font-arabic text-4xl text-stone-800 mb-1">{surah.arabicName}</h1>
          <p className="text-sm text-stone-500">
            {surah.englishName} · {surah.meaning} · {surah.ayahCount} verses
          </p>
        </div>
      </div>

      {/* Verses */}
      <div className="mt-4">
        {surah.ayahs.map((ayah) => (
          <VerseRow
            key={ayah.id}
            ayah={ayah}
            selectedWordId={selectedWord?.id ?? null}
            savedLemmas={savedLemmas}
            onWordTap={handleWordTap}
          />
        ))}
      </div>

      <WordBottomSheet
        word={selectedWord}
        onClose={() => setSelectedWord(null)}
        lists={lists}
        createList={createList}
        addWordToList={addWordToList}
        isWordSaved={isWordSaved}
      />
    </div>
  );
}
