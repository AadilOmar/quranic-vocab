"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useLists } from "@/hooks/useLists";
import FlashCard from "@/components/FlashCard";

export default function FlashCardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { lists } = useLists();
  const [index, setIndex] = useState(0);

  const list = lists.find((l) => l.id === id);

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

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <Link href="/lists" className="text-sm text-stone-400 hover:text-stone-600">← Lists</Link>
        <h1 className="text-base font-semibold text-stone-700">{list.name}</h1>
        <div className="w-12" />
      </div>

      <FlashCard
        item={list.items[index]}
        index={index}
        total={list.items.length}
        onNext={() => setIndex((i) => Math.min(i + 1, list.items.length - 1))}
        onPrev={() => setIndex((i) => Math.max(i - 1, 0))}
      />
    </div>
  );
}
