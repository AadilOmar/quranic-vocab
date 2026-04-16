import Link from "next/link";

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      body: "We collect minimal information, such as basic usage data and any information you choose to provide.",
    },
    {
      title: "How We Use Information",
      body: "We use information only to improve the website and save preferences or progress if applicable.",
    },
    {
      title: "Cookies",
      body: "We may use cookies to remember settings and improve performance.",
    },
    {
      title: "Third-Party Services",
      body: "We may use third-party tools such as hosting, analytics, or database providers.",
    },
    {
      title: "Data Sharing",
      body: "We do not sell or trade your personal information.",
    },
    {
      title: "Security",
      body: "We take reasonable steps to protect your data, but no method is 100% secure.",
    },
  ];

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <div className="max-w-2xl mx-auto px-6 py-10 space-y-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-stone-100 px-6 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
              <span className="font-arabic text-white text-lg leading-none">ق</span>
            </div>
            <span className="text-stone-400 text-sm">Quran Vocabulary</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900">Privacy Policy</h1>
          <p className="mt-1 text-xs text-stone-400">Last updated: April 15, 2026</p>
          <p className="mt-3 text-stone-500 text-sm leading-relaxed">
            This website is created to help users learn Quranic vocabulary. Your privacy is important to us.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.title} className="bg-white rounded-2xl border border-stone-100 px-6 py-5">
            <h2 className="text-base font-semibold text-stone-800 mb-2">{section.title}</h2>
            <p className="text-stone-500 text-sm leading-relaxed">{section.body}</p>
          </div>
        ))}

        {/* Contact */}
        <div className="bg-amber-50 rounded-2xl border border-amber-100 px-6 py-5">
          <h2 className="text-base font-semibold text-stone-800 mb-2">Contact</h2>
          <p className="text-stone-500 text-sm">
            Questions? Reach us at{" "}
            <a href="mailto:aadilomar1@gmail.com" className="text-amber-600 hover:underline">
              aadilomar1@gmail.com
            </a>
          </p>
        </div>
        </div>

        <Link href="/" className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl text-center transition-colors">
          Go to the App
        </Link>
      </div>
    </main>
  );
}
