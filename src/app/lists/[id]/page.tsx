"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useLists, WordStatus } from "@/hooks/useLists";
import FlashCard from "@/components/FlashCard";

type Filter = "learning" | "all";

export default function FlashCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lists, updateWordStatus } = useLists();
  const [filter, setFilter] = useState<Filter>("learning");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const list = lists.find((l) => l.id === id);

  const filteredItems = useMemo(() => {
    if (!list) return [];
    if (filter === "all") return list.items;
    return list.items.filter((item) => item.status !== "known");
  }, [list, filter]);

  const safeIndex = Math.min(index, Math.max(0, filteredItems.length - 1));
  const knownCount = list?.items.filter((i) => i.status === "known").length ?? 0;
  const learningCount = list?.items.filter((i) => i.status !== "known").length ?? 0;

  const handleStatusChange = (status: WordStatus) => {
    if (!list || !filteredItems[safeIndex]) return;
    updateWordStatus(list.id, filteredItems[safeIndex].id, status);
    setFlipped(false);
  };

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.min(i + 1, filteredItems.length - 1)), 150);
  };

  const handlePrev = () => {
    setFlipped(false);
    setTimeout(() => setIndex((i) => Math.max(i - 1, 0)), 150);
  };

  if (!list) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-stone-400">List not found.</p>
        <Link href="/lists" className="text-sm text-amber-600 hover:underline">← My Lists</Link>
      </div>
    );
  }

  if (list.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-4">
        <p className="text-stone-500">No words in this list yet.</p>
        <Link href="/" className="text-sm text-amber-600 hover:underline">Go read a surah →</Link>
      </div>
    );
  }

  if (filter === "learning" && filteredItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-4">
        <p className="text-4xl mb-2">🎉</p>
        <p className="text-stone-700 font-semibold text-lg">All words known!</p>
        <p className="text-stone-400 text-sm">You've marked all {knownCount} words as known.</p>
        <button
          onClick={() => setFilter("all")}
          className="mt-4 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
        >
          Review All Words
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh max-w-xl mx-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <Link href="/lists" className="text-sm text-stone-400 hover:text-stone-600">← Lists</Link>
          <h1 className="text-base font-semibold text-stone-700">{list.name}</h1>
          <div className="w-12" />
        </div>

        {/* Filter toggle */}
        <div className="flex justify-center">
          <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => { setFilter("learning"); setIndex(0); setFlipped(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === "learning" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
              }`}
            >
              Still Learning
              <span className="ml-1.5 text-xs text-amber-600 font-semibold">{learningCount}</span>
            </button>
            <button
              onClick={() => { setFilter("all"); setIndex(0); setFlipped(false); }}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === "all" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
              }`}
            >
              All Words
              <span className="ml-1.5 text-xs text-stone-400 font-semibold">{list.items.length}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable card area */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <FlashCard
          item={filteredItems[safeIndex]}
          index={safeIndex}
          total={filteredItems.length}
          knownCount={knownCount}
          flipped={flipped}
          onFlip={() => setFlipped((f) => !f)}
        />
      </div>

      {/* Pinned bottom buttons */}
      <div className="shrink-0 px-4 pt-3 pb-6 bg-[#FAFAF7] border-t border-stone-100 space-y-2">
        {/* Know It / Still Learning — only when flipped */}
        {flipped && (
          <div className="flex gap-3">
            <button
              onClick={() => handleStatusChange("learning")}
              className="flex-1 py-3 rounded-xl border-2 border-amber-200 text-amber-700 text-sm font-semibold hover:bg-amber-50 transition-colors"
            >
              Still Learning
            </button>
            <button
              onClick={() => handleStatusChange("known")}
              className="flex-1 py-3 rounded-xl border-2 border-green-200 text-green-700 text-sm font-semibold hover:bg-green-50 transition-colors"
            >
              Know It ✓
            </button>
          </div>
        )}

        {/* Nav */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            disabled={safeIndex === 0}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium disabled:opacity-30 transition-colors"
          >
            ← Prev
          </button>
          <button
            onClick={() => setFlipped((f) => !f)}
            className="flex-1 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
          >
            {flipped ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={handleNext}
            disabled={safeIndex === filteredItems.length - 1}
            className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium disabled:opacity-30 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
