/**
 * Parses a sourceWordId ("surahId:ayahId:position") and returns
 * the surah and ayah numbers for display purposes.
 */
export function parseSourceWordId(sourceWordId: string): { surahId: number; ayahId: number } | null {
  const parts = sourceWordId.split(":").map(Number);
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return null;
  return { surahId: parts[0], ayahId: parts[1] };
}
