"use client";

import { use, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLists, WordStatus, ListItem } from "@/hooks/useLists";
import { useSettings } from "@/hooks/useSettings";
import FlashCard from "@/components/FlashCard";

type Filter = "learning" | "known" | "all";
type View = "words" | "practice";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lists, updateWordStatus, removeWordFromList } = useLists();
  const { font } = useSettings();
  const [view, setView] = useState<View>("words");
  const [filter, setFilter] = useState<Filter>("learning");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffledItems, setShuffledItems] = useState<ListItem[]>([]);

  const list = lists.find((l) => l.id === id);

  const sourceItems = useMemo(() => {
    if (!list) return [];
    if (filter === "all") return list.items;
    if (filter === "known") return list.items.filter((item) => item.status === "known");
    return list.items.filter((item) => item.status !== "known");
  }, [list, filter]);

  // In practice view use the shuffled snapshot; in words view use sourceItems directly
  const filteredItems = view === "practice" ? shuffledItems : sourceItems;

  const getBase = (f: Filter) => {
    if (!list) return [];
    if (f === "all") return list.items;
    if (f === "known") return list.items.filter((item) => item.status === "known");
    return list.items.filter((item) => item.status !== "known");
  };

  const startPractice = useCallback((newFilter?: Filter) => {
    const f = newFilter ?? filter;
    setShuffledItems(shuffle(getBase(f)));
    setView("practice");
    setIndex(0);
    setFlipped(false);
  }, [list, filter]);

  const reshuffleForFilter = useCallback((newFilter: Filter) => {
    setFilter(newFilter);
    setShuffledItems(shuffle(getBase(newFilter)));
    setIndex(0);
    setFlipped(false);
  }, [list]);

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

  // ── PRACTICE VIEW ─────────────────────────────────────────────
  if (view === "practice") {
    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-3 px-4">
          <p className="text-4xl mb-2">🎉</p>
          <p className="text-stone-700 font-semibold text-lg">
            {filter === "learning" ? "All words known!" : "No words here yet."}
          </p>
          <p className="text-stone-400 text-sm">
            {filter === "learning"
              ? `You've marked all ${knownCount} words as known.`
              : filter === "known"
              ? "Mark words as known while practicing to see them here."
              : "Add words to this list to get started."}
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => reshuffleForFilter("all")}
              className="px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
            >
              Review All Words
            </button>
            <button
              onClick={() => setView("words")}
              className="px-5 py-2.5 border border-stone-200 text-stone-600 text-sm font-medium rounded-xl hover:bg-stone-50 transition-colors"
            >
              Back to List
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col max-w-xl mx-auto" style={{ height: "calc(100dvh - 4rem)" }}>
        {/* Header */}
        <div className="px-4 pt-6 pb-3 shrink-0">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-base font-semibold text-stone-700">{list.name}</h1>
          </div>

          <div className="flex justify-center">
            <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => reshuffleForFilter("learning")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "learning" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                }`}
              >
                Still Learning
                <span className="ml-1.5 text-xs text-amber-600 font-semibold">{learningCount}</span>
              </button>
              <button
                onClick={() => reshuffleForFilter("known")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "known" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                }`}
              >
                Known
                <span className="ml-1.5 text-xs text-green-500 font-semibold">{knownCount}</span>
              </button>
              <button
                onClick={() => reshuffleForFilter("all")}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === "all" ? "bg-white text-stone-800 shadow-sm" : "text-stone-500"
                }`}
              >
                All
                <span className="ml-1.5 text-xs text-stone-400 font-semibold">{list.items.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <FlashCard
            item={filteredItems[safeIndex]}
            index={safeIndex}
            total={filteredItems.length}
            flipped={flipped}
            font={font}
            onFlip={() => setFlipped((f) => !f)}
            onSwipeLeft={() => safeIndex === filteredItems.length - 1 ? reshuffleForFilter(filter) : handleNext()}
            onSwipeRight={handlePrev}
          />
        </div>

        {/* Pinned buttons */}
        <div className="shrink-0 px-4 pt-3 pb-6 bg-[#FAFAF7] border-t border-stone-100 space-y-2">
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
                Know It
              </button>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              disabled={safeIndex === 0}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium disabled:opacity-30 transition-colors"
            >
              ← Prev
            </button>
            <span className="flex-1 py-2.5 text-center text-sm font-medium text-stone-500">
              {safeIndex + 1} / {filteredItems.length}
            </span>
            {safeIndex === filteredItems.length - 1 ? (
              <button
                onClick={() => reshuffleForFilter(filter)}
                className="flex-1 py-2.5 rounded-xl border border-amber-300 text-amber-600 text-sm font-medium transition-colors"
              >
                Restart ↺
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 text-sm font-medium transition-colors"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── WORD LIST VIEW ─────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-center mb-4">
        <h1 className="text-base font-semibold text-stone-700">{list.name}</h1>
      </div>

      {/* Practice button — always visible */}
      <button
        onClick={() => startPractice()}
        disabled={list.items.length === 0}
        className="w-full py-3 mb-6 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        Test Yourself →
      </button>

      {list.items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500 text-sm">No words yet.</p>
          <p className="text-stone-400 text-sm mt-1">Tap any word while reading to save it.</p>
          <Link
            href="/"
            className="inline-block mt-6 px-5 py-2.5 bg-stone-100 text-stone-600 text-sm font-semibold rounded-xl hover:bg-stone-200 transition-colors"
          >
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {list.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-arabic text-2xl text-stone-800">{item.arabic}</span>
                  {item.status === "known" && (
                    <span className="text-xs text-green-500 font-medium">✓ Known</span>
                  )}
                  {item.status === "learning" && (
                    <span className="text-xs text-amber-500 font-medium">Still learning</span>
                  )}
                </div>
                <p className="text-sm text-stone-500 mt-0.5">{item.meaning}</p>
                {item.root && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    Root: <span className="font-arabic">{item.root}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => removeWordFromList(list.id, item.id)}
                className="text-stone-300 hover:text-red-400 transition-colors p-1"
                aria-label="Remove word"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
