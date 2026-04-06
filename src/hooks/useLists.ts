"use client";

import { useState, useEffect } from "react";

export type WordStatus = "new" | "learning" | "known";

export type ListItem = {
  id: string;
  lemma: string;
  root: string;
  meaning: string;
  arabic: string;
  sourceWordId: string;
  addedAt: string;
  status: WordStatus;
};

export type SavedList = {
  id: string;
  name: string;
  createdAt: string;
  items: ListItem[];
};

const STORAGE_KEY = "quran-vocab-lists";

function loadLists(): SavedList[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const lists: SavedList[] = JSON.parse(raw);
    // Migrate old items that lack a status field
    return lists.map((list) => ({
      ...list,
      items: list.items.map((item) => ({
        ...item,
        status: item.status ?? "new",
      })),
    }));
  } catch {
    return [];
  }
}

function saveLists(lists: SavedList[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(lists));
}

export function useLists() {
  const [lists, setLists] = useState<SavedList[]>([]);

  useEffect(() => {
    setLists(loadLists());
  }, []);

  const createList = (name: string): SavedList => {
    const newList: SavedList = {
      id: crypto.randomUUID(),
      name,
      createdAt: new Date().toISOString(),
      items: [],
    };
    setLists((prev) => {
      const updated = [...prev, newList];
      saveLists(updated);
      return updated;
    });
    return newList;
  };

  const addWordToList = (listId: string, item: Omit<ListItem, "id" | "addedAt" | "status"  >) => {
    setLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id !== listId) return list;
        if (list.items.some((i) => i.lemma === item.lemma)) return list;
        return {
          ...list,
          items: [
            ...list.items,
            { ...item, id: crypto.randomUUID(), addedAt: new Date().toISOString(), status: "new" as WordStatus },
          ],
        };
      });
      saveLists(updated);
      return updated;
    });
  };

  const updateWordStatus = (listId: string, itemId: string, status: WordStatus) => {
    setLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id !== listId) return list;
        return {
          ...list,
          items: list.items.map((item) =>
            item.id === itemId ? { ...item, status } : item
          ),
        };
      });
      saveLists(updated);
      return updated;
    });
  };

  const isWordSaved = (lemma: string): boolean => {
    return lists.some((list) => list.items.some((item) => item.lemma === lemma));
  };

  const deleteList = (listId: string) => {
    setLists((prev) => {
      const updated = prev.filter((l) => l.id !== listId);
      saveLists(updated);
      return updated;
    });
  };

  return { lists, createList, addWordToList, updateWordStatus, isWordSaved, deleteList };
}
