"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

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

export function useLists() {
  const [lists, setLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase
      .from("lists")
      .select("id, name, created_at, list_items(id, lemma, root, meaning, arabic, source_word_id, added_at, status)")
      .order("created_at")
      .then(({ data }) => {
        type RawItem = { id: string; lemma: string; root: string | null; meaning: string; arabic: string; source_word_id: string; added_at: string; status: string };
        type RawList = { id: string; name: string; created_at: string; list_items: RawItem[] };
        const rows = (data ?? []) as RawList[];
        setLists(
          rows.map((l) => ({
            id: l.id,
            name: l.name,
            createdAt: l.created_at,
            items: (l.list_items ?? [])
              .map((i) => ({
                id: i.id,
                lemma: i.lemma,
                root: i.root ?? "",
                meaning: i.meaning,
                arabic: i.arabic,
                sourceWordId: i.source_word_id,
                addedAt: i.added_at,
                status: (i.status as WordStatus) ?? "new",
              }))
              .sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()),
          }))
        );
        setLoading(false);
      });
  }, []);

  const createList = async (name: string): Promise<SavedList> => {
    const { data: { session } } = await getSupabase().auth.getSession();
    if (!session?.user) throw new Error("Not authenticated");
    const user = session.user;

    const { data, error } = await getSupabase()
      .from("lists")
      .insert({ name, user_id: user.id })
      .select()
      .single();

    if (error || !data) throw error;

    const newList: SavedList = {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      items: [],
    };
    setLists((prev) => [...prev, newList]);
    return newList;
  };

  const addWordToList = async (
    listId: string,
    item: Omit<ListItem, "id" | "addedAt" | "status">
  ) => {
    const list = lists.find((l) => l.id === listId);
    if (list?.items.some((i) => i.lemma === item.lemma)) return;

    const { data, error } = await getSupabase()
      .from("list_items")
      .insert({
        list_id: listId,
        lemma: item.lemma,
        root: item.root,
        meaning: item.meaning,
        arabic: item.arabic,
        source_word_id: item.sourceWordId,
        status: "new",
      })
      .select()
      .single();

    if (error || !data) return;

    const newItem: ListItem = {
      id: data.id,
      lemma: data.lemma,
      root: data.root ?? "",
      meaning: data.meaning,
      arabic: data.arabic,
      sourceWordId: data.source_word_id,
      addedAt: data.added_at,
      status: "new",
    };
    setLists((prev) =>
      prev.map((l) =>
        l.id === listId ? { ...l, items: [...l.items, newItem] } : l
      )
    );
  };

  const updateWordStatus = async (
    listId: string,
    itemId: string,
    status: WordStatus
  ) => {
    await getSupabase().from("list_items").update({ status }).eq("id", itemId);
    setLists((prev) =>
      prev.map((l) =>
        l.id !== listId
          ? l
          : { ...l, items: l.items.map((i) => (i.id === itemId ? { ...i, status } : i)) }
      )
    );
  };

  const removeWordFromList = async (listId: string, itemId: string) => {
    await getSupabase().from("list_items").delete().eq("id", itemId);
    setLists((prev) =>
      prev.map((l) =>
        l.id !== listId ? l : { ...l, items: l.items.filter((i) => i.id !== itemId) }
      )
    );
  };

  const deleteList = async (listId: string) => {
    await getSupabase().from("lists").delete().eq("id", listId);
    setLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const isWordSaved = (lemma: string): boolean =>
    lists.some((l) => l.items.some((i) => i.lemma === lemma));

  return {
    lists,
    loading,
    createList,
    addWordToList,
    updateWordStatus,
    removeWordFromList,
    isWordSaved,
    deleteList,
  };
}
