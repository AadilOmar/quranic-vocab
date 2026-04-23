"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";

export const TRANSLATIONS = [
  { id: "en.sahih", name: "Saheeh International" },
  { id: "khattab", name: "Clear Quran (Mustafa Khattab)" },
  { id: "en.pickthall", name: "Pickthall" },
  { id: "en.yusufali", name: "Yusuf Ali" },
];

export const FONTS = [
  { id: "scheherazade", name: "Scheherazade New", category: "Naskh", cssVar: "--font-scheherazade" },
  { id: "amiri", name: "Amiri", category: "Naskh", cssVar: "--font-amiri" },
  { id: "noto-naskh", name: "Noto Naskh Arabic", category: "Naskh", cssVar: "--font-noto-naskh" },
  { id: "noorehuda", name: "Noorehuda", category: "Indopak", cssVar: "--font-noorehuda" },
  { id: "noorehidayat", name: "Noorehidayat", category: "Indopak", cssVar: "--font-noorehidayat" },
  { id: "noorehira", name: "Noorehira", category: "Indopak", cssVar: "--font-noorehira" },
  { id: "noto-nastaliq", name: "Noto Nastaliq Urdu", category: "Nastaliq", cssVar: "--font-noto-nastaliq" },
  { id: "gulzar", name: "Gulzar", category: "Nastaliq", cssVar: "--font-gulzar" },
];

export const DEFAULT_TRANSLATION = "en.sahih";
export const DEFAULT_FONT = "scheherazade";

export const INDOPAK_FONTS = new Set(["noorehidayat", "noorehira", "noorehuda"]);

function syncTranslationCookie(id: string) {
  document.cookie = `translation=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

function syncFontCookie(id: string) {
  document.cookie = `font=${id}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

export function applyFont(fontId: string) {
  const font = FONTS.find((f) => f.id === fontId) ?? FONTS[0];
  document.documentElement.style.setProperty("--active-arabic-font", `var(${font.cssVar})`);
}

export function getFontCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )font=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function useSettings() {
  const [translation, setTranslationState] = useState<string>(DEFAULT_TRANSLATION);
  const [font, setFontState] = useState<string>(DEFAULT_FONT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("user_settings")
      .select("translation, font")
      .single()
      .then(({ data, error }) => {
        if (error) { setLoading(false); return; }
        const t = data?.translation ?? DEFAULT_TRANSLATION;
        const f = data?.font ?? DEFAULT_FONT;
        setTranslationState(t);
        setFontState(f);
        syncTranslationCookie(t);
        syncFontCookie(f);
        applyFont(f);
        setLoading(false);
      });
  }, []);

  const setTranslation = async (id: string) => {
    setTranslationState(id);
    syncTranslationCookie(id);
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) return;
    await getSupabase()
      .from("user_settings")
      .upsert({ user_id: user.id, translation: id });
  };

  const setFont = async (id: string) => {
    setFontState(id);
    applyFont(id);
    syncFontCookie(id);
    const { data: { user } } = await getSupabase().auth.getUser();
    if (!user) return;
    await getSupabase()
      .from("user_settings")
      .upsert({ user_id: user.id, font: id });
  };

  return { translation, setTranslation, font, setFont, translations: TRANSLATIONS, fonts: FONTS, loading };
}
