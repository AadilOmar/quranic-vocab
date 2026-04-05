import { fetchSurah } from "@/lib/quran";
import SurahReader from "@/components/SurahReader";

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const surah = await fetchSurah(Number(id));
  return <SurahReader surah={surah} />;
}
