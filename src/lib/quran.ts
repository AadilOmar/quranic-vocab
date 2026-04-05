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

async function fetchMorphology(surahId: number): Promise<MorphMap> {
  try {
    const res = await fetch(`/data/morphology/${surahId}.json`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

// ── Full surah ───────────────────────────────────────────────

export async function fetchSurah(surahId: number): Promise<Surah> {
  const [versesRes, morphMap] = await Promise.all([
    fetch(
      `${API_BASE}/verses/by_chapter/${surahId}` +
        `?words=true` +
        `&word_fields=text_uthmani,transliteration,translation` +
        `&per_page=300` +
        `&translations=131`,
      { next: { revalidate: 86400 } }
    ),
    fetchMorphology(surahId),
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
      text_uthmani: string;
      translation: { text: string };
      transliteration: { text: string | null };
    }[];
    translations: { text: string }[];
  }) => {
    const ayahId = verse.verse_number;
    const translation = verse.translations?.[0]?.text ?? "";

    const words: Word[] = verse.words
      .filter((w) => w.char_type_name === "word") // skip verse number glyphs
      .map((w) => {
        const morphKey = `${ayahId}:${w.position}`;
        const morph = morphMap[morphKey];
        return {
          id: `${surahId}:${ayahId}:${w.position}`,
          surahId,
          ayahId,
          position: w.position,
          arabic: w.text_uthmani,
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
