"use client";

import { useEffect, useState } from "react";
import { Word } from "@/types";
import { SavedList, ListItem } from "@/hooks/useLists";

type Props = {
  word: Word | null;
  onClose: () => void;
  lists: SavedList[];
  createList: (name: string) => SavedList;
  addWordToList: (listId: string, item: Omit<ListItem, "id" | "addedAt" | "status">) => void;
  isWordSaved: (lemma: string) => boolean;
};

type SheetView = "detail" | "pick-list" | "new-list";

export default function WordBottomSheet({ word, onClose, lists, createList, addWordToList, isWordSaved }: Props) {
  const isOpen = word !== null;
  const [view, setView] = useState<SheetView>("detail");
  const [newListName, setNewListName] = useState("");
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Reset to detail view when word changes
  useEffect(() => {
    setView("detail");
    setSavedFeedback(false);
    setNewListName("");
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

  const handleAddToList = (listId: string) => {
    if (!word) return;
    addWordToList(listId, {
      lemma: word.lemma,
      root: word.root,
      meaning: word.translation,
      arabic: word.arabic,
      sourceWordId: word.id,
    });
    setSavedFeedback(true);
    setView("detail");
  };

  const handleCreateAndAdd = () => {
    if (!newListName.trim() || !word) return;
    const newList = createList(newListName.trim());
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
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white rounded-t-2xl shadow-2xl
          transition-transform duration-300 ease-out max-h-[80vh] overflow-y-auto
          ${isOpen ? "translate-y-0" : "translate-y-full"}`}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {word && (
          <div className="px-5 pb-10 pt-6 max-w-xl mx-auto">

            {/* ── DETAIL VIEW ── */}
            {view === "detail" && (
              <>
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 text-center">
                    <p className="font-arabic text-5xl text-stone-800 leading-tight mb-2">
                      {word.arabic}
                    </p>
                    <p className="text-lg font-medium text-stone-700">
                      {word.translation}
                    </p>
                    <p className="text-sm text-stone-400 mt-0.5">
                      {word.transliteration}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-4 mt-1 text-stone-300 hover:text-stone-500 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                <div className="border-t border-stone-100 mb-5" />

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-stone-400">Root</span>
                    <span className="font-arabic text-xl text-stone-700">{word.root}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-stone-400">Lemma</span>
                    <span className="font-arabic text-xl text-stone-700">{word.lemma}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-stone-400">Part of Speech</span>
                    <span className="text-sm text-stone-600 capitalize">{word.pos}</span>
                  </div>
                </div>

                <div className="border-t border-stone-100 mb-5" />

                {/* Add to list button */}
                {savedFeedback ? (
                  <div className="w-full py-3 rounded-xl bg-green-50 text-green-700 text-sm font-medium text-center">
                    ✓ Saved to list
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
              </>
            )}

            {/* ── PICK LIST VIEW ── */}
            {view === "pick-list" && (
              <>
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={() => setView("detail")} className="text-stone-400 hover:text-stone-600">
                    ←
                  </button>
                  <h2 className="text-base font-semibold text-stone-700">Save to list</h2>
                </div>

                <div className="space-y-2 mb-4">
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
                  className="w-full py-3 rounded-xl border border-dashed border-stone-300 text-stone-500 text-sm hover:border-amber-300 hover:text-amber-600 transition-colors"
                >
                  + New list
                </button>
              </>
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
