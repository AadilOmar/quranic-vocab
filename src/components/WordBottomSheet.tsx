"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Word } from "@/types";
import { SavedList, ListItem } from "@/hooks/useLists";

let lemmaCounts: Record<string, number> | null = null;
async function getLemmaCounts(): Promise<Record<string, number>> {
  if (lemmaCounts) return lemmaCounts;
  const res = await fetch("/data/lemma-counts.json");
  lemmaCounts = await res.json();
  return lemmaCounts!;
}

let rootCounts: Record<string, number> | null = null;
async function getRootCounts(): Promise<Record<string, number>> {
  if (rootCounts) return rootCounts;
  const res = await fetch("/data/root-counts.json");
  rootCounts = await res.json();
  return rootCounts!;
}

type Props = {
  word: Word | null;
  onClose: () => void;
  lists: SavedList[];
  createList: (name: string) => Promise<SavedList>;
  addWordToList: (listId: string, item: Omit<ListItem, "id" | "addedAt" | "status">) => void;
  isWordSaved: (lemma: string) => boolean;
  onPrev?: () => void;
  onNext?: () => void;
  prevWord?: Word;
  nextWord?: Word;
};

type SheetView = "detail" | "pick-list" | "new-list";

export default function WordBottomSheet({ word, onClose, lists, createList, addWordToList, isWordSaved, onPrev, onNext, prevWord, nextWord }: Props) {
  const isOpen = word !== null;
  const [view, setView] = useState<SheetView>("detail");
  const [newListName, setNewListName] = useState("");
  const [savedFeedback, setSavedFeedback] = useState<"saved" | "error" | null>(null);
  const [occurrences, setOccurrences] = useState<number | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const prevPeekRef = useRef<HTMLDivElement>(null);
  const nextPeekRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const isDragging = useRef(false);
  const swipeDir = useRef<"left" | "right">("left");
  const [cardKey, setCardKey] = useState(0);
  const skipRemount = useRef(false);
  const hasPrevRef = useRef(!!prevWord);
  const hasNextRef = useRef(!!nextWord);
  const [rootOccurrences, setRootOccurrences] = useState<number | null>(null);

  useEffect(() => { hasPrevRef.current = !!prevWord; }, [prevWord]);
  useEffect(() => { hasNextRef.current = !!nextWord; }, [nextWord]);

  // Reset to detail view when word changes — useLayoutEffect runs before paint
  useLayoutEffect(() => {
    setView("detail");
    setSavedFeedback(null);
    setNewListName("");
    if (skipRemount.current) {
      skipRemount.current = false;
      if (cardRef.current) {
        cardRef.current.style.transition = "none";
        cardRef.current.style.transform = "translateX(0)";
        cardRef.current.style.opacity = "1";
      }
      [prevPeekRef, nextPeekRef].forEach((r) => {
        if (r.current) { r.current.style.transition = "none"; r.current.style.opacity = "0"; }
      });
    } else {
      setCardKey((k) => k + 1);
    }
    let active = true;
    if (word?.lemma) {
      getLemmaCounts().then((counts) => { if (active) setOccurrences(counts[word.lemma] ?? 0); });
    }
    if (word?.root) {
      getRootCounts().then((counts) => { if (active) setRootOccurrences(counts[word.root] ?? 0); });
    }
    return () => { active = false; };
  }, [word?.id]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (view !== "detail") setView("detail");
        else onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, view]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // Drag-to-navigate: card follows finger, flies out on release
  useEffect(() => {
    const el = sheetRef.current;
    if (!el) return;

    const cardWidth = el.offsetWidth || window.innerWidth;

    const hideAllPeeks = (instant = true) => {
      [prevPeekRef, nextPeekRef].forEach((r) => {
        if (!r.current) return;
        if (instant) r.current.style.transition = "none";
        r.current.style.opacity = "0";
        r.current.style.transform = "";
      });
    };

    const onStart = (e: TouchEvent) => {
      dragStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      isDragging.current = false;
      if (cardRef.current) cardRef.current.style.transition = "none";
      hideAllPeeks(true);
    };

    const onMove = (e: TouchEvent) => {
      if (!dragStart.current) return;
      const dx = e.touches[0].clientX - dragStart.current.x;
      const dy = e.touches[0].clientY - dragStart.current.y;
      if (!isDragging.current) {
        if (Math.abs(dx) < Math.abs(dy)) return;
        // Block drag at boundaries
        if (dx < 0 && !hasPrevRef.current) return;
        if (dx > 0 && !hasNextRef.current) return;
        isDragging.current = true;
      }
      e.preventDefault();

      // Move main card
      if (cardRef.current) {
        cardRef.current.style.transform = `translateX(${dx}px)`;
        cardRef.current.style.opacity = String(Math.max(0.3, 1 - Math.abs(dx) / 300));
      }

      // Move peek card: opposite side of swipe direction
      const peekRef = dx < 0 ? prevPeekRef : nextPeekRef;
      const origin = dx < 0 ? cardWidth : -cardWidth;
      if (peekRef.current) {
        peekRef.current.style.transition = "none";
        peekRef.current.style.transform = `translateX(${origin + dx}px)`;
        peekRef.current.style.opacity = String(Math.min(1, Math.abs(dx) / 100));
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!dragStart.current) return;
      const dx = e.changedTouches[0].clientX - dragStart.current.x;
      dragStart.current = null;
      if (!isDragging.current) return;
      isDragging.current = false;

      const transition = "transform 0.2s ease, opacity 0.2s ease";
      const peekRef = dx < 0 ? prevPeekRef : nextPeekRef;

      if (Math.abs(dx) >= 80) {
        // Fly out
        if (cardRef.current) {
          cardRef.current.style.transition = transition;
          cardRef.current.style.transform = `translateX(${dx < 0 ? -cardWidth : cardWidth}px)`;
          cardRef.current.style.opacity = "0";
        }
        // Peek slides to center
        if (peekRef.current) {
          peekRef.current.style.transition = transition;
          peekRef.current.style.transform = "translateX(0)";
          peekRef.current.style.opacity = "1";
        }
        setTimeout(() => {
          swipeDir.current = dx < 0 ? "left" : "right";
          skipRemount.current = true;
          if (dx < 0) onPrev?.(); else onNext?.();
        }, 200);
      } else {
        // Snap back
        if (cardRef.current) {
          cardRef.current.style.transition = transition;
          cardRef.current.style.transform = "translateX(0)";
          cardRef.current.style.opacity = "1";
        }
        if (peekRef.current) {
          peekRef.current.style.transition = transition;
          peekRef.current.style.opacity = "0";
        }
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [onPrev, onNext]);

  const handleAddToList = async (listId: string) => {
    if (!word) return;
    try {
      await addWordToList(listId, {
        lemma: word.lemma,
        root: word.root,
        meaning: word.translation,
        arabic: word.arabic,
        sourceWordId: word.id,
      });
      setSavedFeedback("saved");
    } catch {
      setSavedFeedback("error");
    }
    setView("detail");
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim() || !word) return;
    const newList = await createList(newListName.trim());
    handleAddToList(newList.id);
    setNewListName("");
  };

  const alreadySaved = word ? isWordSaved(word.lemma) : false;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/30 z-30 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Sheet panel */}
      <div
        ref={sheetRef}
        className={`fixed bottom-16 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl
          transition-transform duration-300 ease-out overflow-y-auto
          ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {word && (
          <div className="px-5 pb-10 pt-6 max-w-xl mx-auto flex flex-col h-[420px]">

            {/* ── DETAIL VIEW ── */}
            {view === "detail" && (
              <div className="flex flex-col flex-1">
                <div className="relative mb-1">
                  <button
                    onClick={onClose}
                    className="absolute right-0 top-0 text-stone-300 hover:text-stone-500 text-2xl leading-none z-10"
                  >
                    ×
                  </button>
                </div>

                {/* Card area — relative container for peek + current card */}
                <div className="relative mb-4 overflow-hidden">

                {/* Prev peek card — always in DOM, hidden via opacity/style */}
                {prevWord && (
                  <div ref={prevPeekRef} className="absolute inset-0 bg-stone-50 rounded-2xl px-5 py-5 min-h-[220px]" style={{ opacity: 0 }}>
                    <div className="text-center mb-4">
                      <p className="font-arabic text-5xl text-stone-800 leading-tight mb-2">{prevWord.arabic}</p>
                      <p className="text-lg font-medium text-stone-700">{prevWord.translation}</p>
                      <p className="text-sm text-stone-400 mt-0.5">{prevWord.transliteration}</p>
                    </div>
                    <div className="border-t border-stone-200 mb-4" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-stone-400">Root</span>
                        <span className="font-arabic text-xl text-stone-700">{prevWord.root || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-stone-400">Lemma</span>
                        <span className="font-arabic text-xl text-stone-700">{prevWord.lemma || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-stone-400">Part of Speech</span>
                        <span className="text-sm text-stone-700 capitalize">{prevWord.pos}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next peek card */}
                {nextWord && (
                  <div ref={nextPeekRef} className="absolute inset-0 bg-stone-50 rounded-2xl px-5 py-5 min-h-[220px]" style={{ opacity: 0 }}>
                    <div className="text-center mb-4">
                      <p className="font-arabic text-5xl text-stone-800 leading-tight mb-2">{nextWord.arabic}</p>
                      <p className="text-lg font-medium text-stone-700">{nextWord.translation}</p>
                      <p className="text-sm text-stone-400 mt-0.5">{nextWord.transliteration}</p>
                    </div>
                    <div className="border-t border-stone-200 mb-4" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-stone-400">Root</span>
                        <span className="font-arabic text-xl text-stone-700">{nextWord.root || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-stone-400">Lemma</span>
                        <span className="font-arabic text-xl text-stone-700">{nextWord.lemma || "—"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs uppercase tracking-widest text-stone-400">Part of Speech</span>
                        <span className="text-sm text-stone-700 capitalize">{nextWord.pos}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Swipeable card */}
                <div
                  key={cardKey}
                  ref={cardRef}
                  className="bg-stone-50 rounded-2xl px-5 py-5 overflow-hidden relative min-h-[220px]"
                >
                  <div className="text-center mb-4">
                    <p className="font-arabic text-5xl text-stone-800 leading-tight mb-2">
                      {word.arabic}
                    </p>
                    <p className="text-lg font-medium text-stone-700">{word.translation}</p>
                    <p className="text-sm text-stone-400 mt-0.5">{word.transliteration}</p>
                  </div>

                  <div className="border-t border-stone-200 mb-4" />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-stone-400">Root</span>
                      <div className="flex items-center gap-2">
                        {word.root && rootOccurrences !== null && (
                          <span className="text-xs text-stone-400">{rootOccurrences.toLocaleString()} occurrences</span>
                        )}
                        <span className="font-arabic text-xl text-stone-700">{word.root || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-stone-400">Lemma</span>
                      <div className="flex items-center gap-2">
                        {word.lemma && occurrences !== null && (
                          <span className="text-xs text-stone-400">{occurrences.toLocaleString()} occurrences</span>
                        )}
                        <span className="font-arabic text-xl text-stone-700">{word.lemma || "—"}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-stone-400">Part of Speech</span>
                      <span className="text-sm text-stone-700 capitalize">{word.pos}</span>
                    </div>
                  </div>
                </div>

                </div>{/* end card area */}

                {/* Add to list button — outside card */}
                <div className="mt-auto">
                {savedFeedback === "saved" ? (
                  <div className="w-full py-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium text-center">
                    ✓ Saved to list
                  </div>
                ) : savedFeedback === "error" ? (
                  <div className="w-full py-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium text-center">
                    Failed to save — try again
                  </div>
                ) : alreadySaved ? (
                  <button
                    onClick={() => setView("pick-list")}
                    className="w-full py-3 rounded-xl border border-amber-300 text-amber-700 text-sm font-medium hover:bg-amber-50 transition-colors"
                  >
                    Saved — add to another list
                  </button>
                ) : (
                  <button
                    onClick={() => setView("pick-list")}
                    className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Add to List
                  </button>
                )}
                </div>
              </div>
            )}

            {/* ── PICK LIST VIEW ── */}
            {view === "pick-list" && (
              <div className="flex flex-col flex-1 min-h-0">
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setView("detail")} className="text-stone-400 hover:text-stone-600">
                    ←
                  </button>
                  <h2 className="text-base font-semibold text-stone-700">Save to list</h2>
                </div>

                <div className="space-y-2 mb-4 flex-1 min-h-0 overflow-y-auto">
                  {lists.length === 0 && (
                    <p className="text-sm text-stone-400 text-center py-4">
                      No lists yet. Create one below.
                    </p>
                  )}
                  {lists.map((list) => (
                    <button
                      key={list.id}
                      onClick={() => handleAddToList(list.id)}
                      className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-stone-100 hover:border-amber-200 hover:bg-amber-50 transition-colors text-left"
                    >
                      <span className="text-sm font-medium text-stone-700">{list.name}</span>
                      <span className="text-xs text-stone-400">{list.items.length} words</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setView("new-list")}
                  className="mt-auto w-full py-3 rounded-xl border border-dashed border-stone-300 text-stone-500 text-sm hover:border-amber-300 hover:text-amber-600 transition-colors"
                >
                  + New list
                </button>
              </div>
            )}

            {/* ── NEW LIST VIEW ── */}
            {view === "new-list" && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setView("pick-list")} className="text-stone-400 hover:text-stone-600">
                    ←
                  </button>
                  <h2 className="text-base font-semibold text-stone-700">New list</h2>
                </div>

                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateAndAdd()}
                  placeholder="e.g. Baqarah words"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-400 mb-3"
                />
                <button
                  onClick={handleCreateAndAdd}
                  disabled={!newListName.trim()}
                  className="w-full py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Create & Save
                </button>
              </>
            )}

          </div>
        )}
      </div>
    </>
  );
}
