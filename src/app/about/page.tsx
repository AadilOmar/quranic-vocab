import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Logo + Title */}
        <div className="flex items-center gap-3 mb-8">
          <a href="/" className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shrink-0">
            <span className="font-arabic text-white text-xl leading-none">ق</span>
          </a>
          <div>
            <h1 className="text-xl font-bold text-stone-900 leading-tight">Quran Vocabulary</h1>
            <p className="text-xs text-stone-400">quranvocab.org</p>
          </div>
        </div>

        {/* Mission */}
        <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 mb-4">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-3">Mission</h2>
          <p className="text-stone-700 leading-relaxed">
            Built for anyone wanting to build a deeper connection with the Quran. Pick words as you read, save them to lists, and test yourself with Quizlet-style flashcards.
          </p>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6 mb-4">
          <h2 className="text-sm font-semibold text-amber-600 uppercase tracking-wide mb-4">How It Works</h2>
          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Read the Quran",
                desc: "Browse any surah and tap on any word to instantly see its meaning, root, and how often it appears in the Quran.",
              },
              {
                step: "2",
                title: "Save words as you go",
                desc: "Tap any word to see its meaning and add it to a custom list, curated by you.",
              },
              {
                step: "3",
                title: "Learn in context",
                desc: "Test yourself with flashcards and see each word inside the verse it came from - so you learn vocabulary the way it's used.",
              },
              {
                step: "4",
                title: "Build over time",
                desc: "The most frequent words in the Quran repeat thousands of times. Learning just 300 words gives you over 70% coverage.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4">
                <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-amber-700 text-xs font-semibold">{step}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800">{title}</p>
                  <p className="text-sm text-stone-500 leading-relaxed mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 px-6 py-5 mb-4">
          <h2 className="text-base font-semibold text-stone-800 mb-2">Contact</h2>
          <p className="text-stone-500 text-sm">
            Questions, feedback, or feature requests? Reach us at{" "}
            <a href="mailto:aadilomar1@gmail.com" className="text-amber-600 hover:underline">
              aadilomar1@gmail.com
            </a>
          </p>
        </div>

        {/* CTA */}
        <Link href="/login" className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl text-center transition-colors mb-4">
          Start Learning - it's free
        </Link>

        <div className="text-center">
          <Link href="/privacy" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">
            Privacy Policy
          </Link>
        </div>


      </div>
    </main>
  );
}
