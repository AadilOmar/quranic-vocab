"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { Surah, Word } from "@/types";
import VerseRow from "./VerseRow";
import WordBottomSheet from "./WordBottomSheet";
import { useLists } from "@/hooks/useLists";
import { useReadingHistory } from "@/hooks/useReadingHistory";
import { getSupabase } from "@/lib/supabase";

type Props = { surah: Surah };

export default function SurahReader({ surah }: Props) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const { lists, createList, addWordToList, isWordSaved, defaultListId, setDefaultList } = useLists();
  const { saveProgress } = useReadingHistory();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // One-time scroll to last read verse on mount
  useEffect(() => {
    getSupabase()
      .from("reading_history")
      .select("last_verse")
      .eq("surah_id", surah.id)
      .single()
      .then(({ data }) => {
        if (data?.last_verse && data.last_verse > 1) {
          setTimeout(() => {
            document.getElementById(`verse-${data.last_verse}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 300);
        }
      });
  }, []);

  // Track current verse with Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (!visible[0]) return;
        const verseId = parseInt(visible[0].target.id.replace("verse-", ""));
        if (isNaN(verseId)) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
          saveProgress(surah.id, surah.englishName, verseId);
        }, 1500);
      },
      { threshold: 0.5 }
    );
    surah.ayahs.forEach((ayah) => {
      const el = document.getElementById(`verse-${ayah.id}`);
      if (el) observer.observe(el);
    });
    return () => {
      observer.disconnect();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [surah.id]);

  const savedLemmas = useMemo(() => {
    const lemmas = new Set<string>();
    lists.forEach((list) => list.items.forEach((item) => lemmas.add(item.lemma)));
    return lemmas;
  }, [lists]);

  const allWords = useMemo(() => surah.ayahs.flatMap((a) => a.words), [surah]);
  const selectedIdx = selectedWord ? allWords.findIndex((w) => w.id === selectedWord.id) : -1;
  const verseWords = selectedWord ? (surah.ayahs.find((a) => a.id === selectedWord.ayahId)?.words ?? []) : [];
  const verseIdx = selectedWord ? verseWords.findIndex((w) => w.id === selectedWord.id) : -1;
  const prevWord = verseIdx > 0 ? verseWords[verseIdx - 1] : undefined;
  const nextWord = verseIdx >= 0 && verseIdx < verseWords.length - 1 ? verseWords[verseIdx + 1] : undefined;

  const handleWordTap = (word: Word) => {
    setSelectedWord((prev) => (prev?.id === word.id ? null : word));
  };

  const handlePrevWord = () => {
    if (prevWord) setSelectedWord(prevWord);
  };

  const handleNextWord = () => {
    if (nextWord) setSelectedWord(nextWord);
  };

  return (
    <div className="max-w-xl mx-auto px-4 pb-16">
      {/* Header */}
      <div className="sticky top-0 bg-[#FAFAF7] border-b border-stone-200 mb-2 z-10">
        <div className="relative flex items-center h-10">
          <a href="/" className="text-sm font-medium text-amber-600 z-10">← Read</a>
          <p className="absolute inset-0 flex items-center justify-center text-xs uppercase tracking-widest text-stone-400 pointer-events-none">
            Surah {surah.id}
          </p>
        </div>
        <div className="text-center pb-4">
          <h1 className="font-arabic text-4xl text-stone-800 mt-1">{surah.arabicName}</h1>
          <p className="text-sm text-stone-500 mt-3">
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
        defaultListId={defaultListId}
        onPrev={handlePrevWord}
        onNext={handleNextWord}
        prevWord={prevWord}
        nextWord={nextWord}
      />
    </div>
  );
}
