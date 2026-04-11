"use client";

import Link from "next/link";
import { useLists } from "@/hooks/useLists";

export default function ListsPage() {
  const { lists, deleteList } = useLists();

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800 mb-1">My Lists</h1>
        <p className="text-sm text-stone-400">Words you've saved while reading.</p>
      </div>

      {lists.length === 0 ? (
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
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm"
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
                <span className="text-stone-300 text-lg">→</span>
              </Link>
              <button
                onClick={() => {
                  if (confirm(`Delete "${list.name}"?`)) deleteList(list.id);
                }}
                className="text-stone-300 hover:text-red-400 transition-colors text-sm px-2"
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
