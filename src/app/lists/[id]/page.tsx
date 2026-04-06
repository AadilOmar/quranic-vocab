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

  const list = lists.find((l) => l.id === id);

  const filteredItems = useMemo(() => {
    if (!list) return [];
    if (filter === "all") return list.items;
    return list.items.filter((item) => item.status !== "known");
  }, [list, filter]);

  // Reset index when filter changes or items change
  const safeIndex = Math.min(index, Math.max(0, filteredItems.length - 1));

  const knownCount = list?.items.filter((i) => i.status === "known").length ?? 0;
  const learningCount = list?.items.filter((i) => i.status !== "known").length ?? 0;

  const handleStatusChange = (itemId: string, status: WordStatus) => {
    if (!list) return;
    updateWordStatus(list.id, itemId, status);
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

  // All words known in "learning" filter
  if (filter === "learning" && filteredItems.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <Link href="/lists" className="text-sm text-stone-400 hover:text-stone-600">← Lists</Link>
          <h1 className="text-base font-semibold text-stone-700">{list.name}</h1>
          <div className="w-12" />
        </div>
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎉</p>
          <p className="text-stone-700 font-semibold text-lg mb-1">All words known!</p>
          <p className="text-stone-400 text-sm mb-6">You've marked all {knownCount} words as known.</p>
          <button
            onClick={() => setFilter("all")}
            className="px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
          >
            Review All Words
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link href="/lists" className="text-sm text-stone-400 hover:text-stone-600">← Lists</Link>
        <h1 className="text-base font-semibold text-stone-700">{list.name}</h1>
        <div className="w-12" />
      </div>

      {/* Filter toggle */}
      <div className="flex items-center justify-center mb-6">
        <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
          <button
            onClick={() => { setFilter("learning"); setIndex(0); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "learning"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            Still Learning
            <span className="ml-1.5 text-xs text-amber-600 font-semibold">{learningCount}</span>
          </button>
          <button
            onClick={() => { setFilter("all"); setIndex(0); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-white text-stone-800 shadow-sm"
                : "text-stone-500 hover:text-stone-700"
            }`}
          >
            All Words
            <span className="ml-1.5 text-xs text-stone-400 font-semibold">{list.items.length}</span>
          </button>
        </div>
      </div>

      <FlashCard
        item={filteredItems[safeIndex]}
        index={safeIndex}
        total={filteredItems.length}
        knownCount={knownCount}
        onNext={() => setIndex((i) => Math.min(i + 1, filteredItems.length - 1))}
        onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
