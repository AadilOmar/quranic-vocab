import Link from "next/link";
import { fetchChapters } from "@/lib/quran";
import RecentlyRead from "@/components/RecentlyRead";

export default async function Home() {
  const surahs = await fetchChapters();

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-800 mb-1">Quran Vocabulary</h1>
        <p className="text-sm text-stone-400">Tap any word to learn its meaning and root, and save it to a flashcard list.</p>
      </div>

      <RecentlyRead />

      <div className="space-y-2">
        {surahs.map((surah) => (
          <Link
            key={surah.id}
            href={`/surah/${surah.id}`}
            className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-100 shadow-sm hover:shadow-md hover:border-amber-200 transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 text-amber-700 text-sm font-semibold border border-amber-200 shrink-0">
                {surah.id}
              </span>
              <div>
                <p className="font-medium text-stone-800">{surah.englishName}</p>
                <p className="text-xs text-stone-400">
                  {surah.meaning} · {surah.ayahCount} verses
                </p>
              </div>
            </div>
            <span className="font-arabic text-2xl text-stone-600">{surah.arabicName}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
