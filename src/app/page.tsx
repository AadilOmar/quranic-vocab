import Link from "next/link";
import { fetchChapters } from "@/lib/quran";
import RecentlyRead from "@/components/RecentlyRead";

export default async function Home() {
  const surahs = await fetchChapters();

  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 h-16 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
          <span className="font-arabic text-white text-lg leading-none">ق</span>
        </div>
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">Quran Vocabulary</h1>
      </div>

      <div className="px-4 pt-6 pb-16">
      <RecentlyRead />

      <div className="space-y-2">
        {surahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className="flex items-center justify-between gap-3 p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200 shrink-0">
                {surah.id}
              </span>
              <div className="min-w-0">
                <p className="font-medium text-stone-800 truncate">{surah.englishName}</p>
                <p className="text-xs text-stone-400 truncate">
                  {surah.meaning} · {surah.ayahCount} verses
                </p>
              </div>
            </div>
            <span className="font-arabic text-2xl text-stone-600 shrink-0">{surah.arabicName}</span>
          </Link>
        ))}
      </div>
      </div>
    </div>
  );
}
