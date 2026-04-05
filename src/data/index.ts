import { fatiha } from "./fatiha";
import { Ayah } from "@/types";

const ALL_SURAHS = [fatiha];

export function getAyahByWordId(sourceWordId: string): Ayah | null {
  // sourceWordId format: "surahId:ayahId:position"
  const [surahId, ayahId] = sourceWordId.split(":").map(Number);
  const surah = ALL_SURAHS.find((s) => s.id === surahId);
  return surah?.ayahs.find((a) => a.id === ayahId) ?? null;
}
