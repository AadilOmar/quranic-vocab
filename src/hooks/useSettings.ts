"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

export const TRANSLATIONS = [
  { id: "en.sahih", name: "Saheeh International" },
  { id: "khattab", name: "Clear Quran (Mustafa Khattab)" },
  { id: "en.pickthall", name: "Pickthall" },
  { id: "en.yusufali", name: "Yusuf Ali" },
];

export const DEFAULT_TRANSLATION = "en.sahih";

function syncCookie(id: string) {
  document.cookie = `translation=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function useSettings() {
  const [translation, setTranslationState] = useState<string>(DEFAULT_TRANSLATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("user_settings")
      .select("translation")
      .single()
      .then(({ data }) => {
        const t = data?.translation ?? DEFAULT_TRANSLATION;
        setTranslationState(t);
        syncCookie(t);
        setLoading(false);
      });
  }, []);

  const setTranslation = async (id: string) => {
    setTranslationState(id);
    syncCookie(id);
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) return;
    await getSupabase()
      .from("user_settings")
      .upsert({ user_id: user.id, translation: id });
  };

  return { translation, setTranslation, translations: TRANSLATIONS, loading };
}
