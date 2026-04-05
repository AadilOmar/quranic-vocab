"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { fatiha } from "@/data/fatiha";
import { Word } from "@/types";
import VerseRow from "@/components/VerseRow";
import WordBottomSheet from "@/components/WordBottomSheet";
import { useLists } from "@/hooks/useLists";


const SURAH_DATA: Record<number, typeof fatiha> = {
  1: fatiha,
};

export default function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const surahId = parseInt(id);
  const surah = SURAH_DATA[surahId];
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const { lists, createList, addWordToList, isWordSaved } = useLists();

  // Build a set of saved lemmas for fast lookup
  const savedLemmas = useMemo(() => {
    const lemmas = new Set<string>();
    lists.forEach((list) => list.items.forEach((item) => lemmas.add(item.lemma)));
    return lemmas;
  }, [lists]);

  if (!surah) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-stone-400">Surah not found.</p>
      </div>
    );
  }

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
          <h1 className="font-arabic text-4xl text-stone-800 mb-1">
            {surah.arabicName}
          </h1>
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
