"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

export type HistoryEntry = {
  surahId: number;
  surahName: string;
  lastVerse: number;
  visitedAt: string;
};

export function useReadingHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    getSupabase()
      .from("reading_history")
      .select("surah_id, surah_name, last_verse, visited_at")
      .order("visited_at", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) {
          setHistory(
            data.map((r) => ({
              surahId: r.surah_id,
              surahName: r.surah_name,
              lastVerse: r.last_verse,
              visitedAt: r.visited_at,
            }))
          );
        }
      });
  }, []);

  const saveProgress = async (surahId: number, surahName: string, lastVerse: number) => {
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) return;
    await getSupabase()
      .from("reading_history")
      .upsert(
        { user_id: user.id, surah_id: surahId, surah_name: surahName, last_verse: lastVerse, visited_at: new Date().toISOString() },
        { onConflict: "user_id,surah_id" }
      );
    setHistory((prev) => {
      const filtered = prev.filter((h) => h.surahId !== surahId);
      return [{ surahId, surahName, lastVerse, visitedAt: new Date().toISOString() }, ...filtered].slice(0, 5);
    });
  };

  return { history, saveProgress };
}
