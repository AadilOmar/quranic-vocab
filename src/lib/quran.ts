import { readFileSync } from "fs";
import { join } from "path";
import { Surah, Ayah, Word } from "@/types";

const API_BASE = "https://api.quran.com/api/v4";


export type ChapterInfo = {
  id: number;
  arabicName: string;
  englishName: string;
  meaning: string;
  ayahCount: number;
};

// ── Chapter list ──────────────────────────────────────────────

export async function fetchChapters(): Promise<ChapterInfo[]> {
  const res = await fetch(`${API_BASE}/chapters?language=en`, {
    next: { revalidate: 86400 }, // cache 24h
  });
  if (!res.ok) throw new Error("Failed to fetch chapters");
  const data = await res.json();
  return data.chapters.map((c: {
    id: number;
    name_arabic: string;
    name_simple: string;
    translated_name: { name: string };
    verses_count: number;
  }) => ({
    id: c.id,
    arabicName: c.name_arabic,
    englishName: c.name_simple,
    meaning: c.translated_name.name,
    ayahCount: c.verses_count,
  }));
}

// ── Morphology data ──────────────────────────────────────────

type MorphEntry = { root: string | null; lemma: string | null; pos: string };
type MorphMap = Record<string, MorphEntry>; // key: "ayah:word"

function fetchMorphology(surahId: number): MorphMap {
  try {
    const filePath = join(process.cwd(), "public", "data", "morphology", `${surahId}.json`);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// ── Full surah ───────────────────────────────────────────────

async function fetchAyahTranslations(surahId: number, translationId: string): Promise<Record<number, string>> {
  const map: Record<number, string> = {};

  if (translationId === "khattab") {
    const res = await fetch(
      `https://cdn.jsdelivr.net/gh/fawazahmed0/quran-api@1/editions/eng-mustafakhattaba/${surahId}.json`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return map;
    const data = await res.json();
    for (const entry of data.chapter ?? []) {
      map[entry.verse] = entry.text;
    }
    return map;
  }

  const res = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}/${translationId}`, {
    next: { revalidate: 86400 },
  });
  if (!res.ok) return map;
  const data = await res.json();
  for (const ayah of data.data?.ayahs ?? []) {
    map[ayah.numberInSurah] = ayah.text;
  }
  return map;
}

const INDOPAK_FONTS = new Set(["noorehidayat", "noorehira", "noorehuda"]);

export async function fetchSurah(surahId: number, translationId = "en.sahih", fontId = "scheherazade"): Promise<Surah> {
  const morphMap = fetchMorphology(surahId);
  const isIndopak = INDOPAK_FONTS.has(fontId);
  const wordTextField = isIndopak ? "text_indopak" : "text_uthmani";

  const [versesRes, translationMap] = await Promise.all([
    fetch(
      `${API_BASE}/verses/by_chapter/${surahId}` +
        `?words=true` +
        `&word_fields=${wordTextField},transliteration,translation` +
        `&per_page=300`,
      { next: { revalidate: 86400 } }
    ),
    fetchAyahTranslations(surahId, translationId),
  ]);

  if (!versesRes.ok) throw new Error(`Failed to fetch surah ${surahId}`);
  const versesData = await versesRes.json();

  const chapterRes = await fetch(`${API_BASE}/chapters/${surahId}?language=en`, {
    next: { revalidate: 86400 },
  });
  const chapterData = await chapterRes.json();
  const chapter = chapterData.chapter;

  const ayahs: Ayah[] = versesData.verses.map((verse: {
    verse_number: number;
    words: {
      id: number;
      position: number;
      char_type_name: string;
      text_uthmani?: string;
      text_indopak?: string;
      translation: { text: string };
      transliteration: { text: string | null };
    }[];
  }) => {
    const ayahId = verse.verse_number;
    const translation = translationMap[ayahId] ?? "";

    const words: Word[] = verse.words
      .filter((w) => w.char_type_name === "word") // skip verse number glyphs
      .map((w) => {
        const morphKey = `${ayahId}:${w.position}`;
        const morph = morphMap[morphKey];
        const rawText = (isIndopak ? w.text_indopak : w.text_uthmani) ?? "";
        return {
          id: `${surahId}:${ayahId}:${w.position}`,
          surahId,
          ayahId,
          position: w.position,
          arabic: rawText.trim(),
          transliteration: w.transliteration?.text ?? "",
          translation: w.translation?.text ?? "",
          lemma: morph?.lemma ?? "",
          root: morph?.root ?? "",
          pos: morph?.pos ?? "",
        };
      });

    return { id: ayahId, surahId, translation, words };
  });

  return {
    id: surahId,
    arabicName: chapter.name_arabic,
    englishName: chapter.name_simple,
    meaning: chapter.translated_name.name,
    ayahCount: chapter.verses_count,
    ayahs,
  };
}
