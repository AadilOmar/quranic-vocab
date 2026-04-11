import { cookies } from "next/headers";
import { fetchSurah } from "@/lib/quran";
import SurahReader from "@/components/SurahReader";

export default async function SurahPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cookieStore = await cookies();
  const translationId = cookieStore.get("translation")?.value ?? "en.sahih";
  const surah = await fetchSurah(Number(id), translationId);
  return <SurahReader surah={surah} />;
}
