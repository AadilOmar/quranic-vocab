"use client";

import { useState } from "react";
import Link from "next/link";
import { useLists } from "@/hooks/useLists";

export default function ListsPage() {
  const { lists, loading, deleteList } = useLists();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const confirmList = lists.find((l) => l.id === confirmId);

  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 h-16 flex items-center">
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">My Lists</h1>
      </div>

      <div className="px-4 pt-6 pb-24">
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-stone-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">📖</p>
          <p className="text-stone-500 text-sm">No lists yet.</p>
          <p className="text-stone-400 text-sm mt-1">
            Tap any word while reading to save it.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 px-5 py-2.5 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors"
          >
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {lists.map((list) => (
            <div
              key={list.id}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:border-amber-200 hover:shadow-md transition-all"
            >
              <Link
                href={`/lists/${list.id}`}
                className="flex-1 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-stone-800">{list.name}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {list.items.length} {list.items.length === 1 ? "word" : "words"}
                    {list.items.some((i) => i.status === "known") && (
                      <span className="ml-1.5 text-green-500">
                        · {list.items.filter((i) => i.status === "known").length} known
                      </span>
                    )}
                    {list.items.filter((i) => i.status !== "known").length > 0 && (
                      <span className="ml-1.5 text-amber-500">
                        · {list.items.filter((i) => i.status !== "known").length} still learning
                      </span>
                    )}
                  </p>
                </div>
              </Link>
              <button
                onClick={() => setConfirmId(list.id)}
                className="text-stone-300 hover:text-red-400 transition-colors text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      </div>

      {/* Delete confirmation modal */}
      {confirmId && confirmList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/30" onClick={() => setConfirmId(null)}>
          <div className="w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 pt-6 pb-4">
              <p className="text-base font-semibold text-stone-900">Delete &ldquo;{confirmList.name}&rdquo;?</p>
              <p className="text-sm text-stone-400 mt-1">This will permanently remove the list and all its words.</p>
            </div>
            <div className="flex border-t border-stone-100">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-4 text-sm font-medium text-stone-500 hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <div className="w-px bg-stone-100" />
              <button
                onClick={() => { deleteList(confirmId); setConfirmId(null); }}
                className="flex-1 py-4 text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
