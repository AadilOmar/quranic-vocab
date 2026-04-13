"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSettings, TRANSLATIONS, FONTS } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const { translation, setTranslation, font, setFont, loading } = useSettings();

  return (
    <div className="max-w-xl mx-auto px-4 py-10 pb-24">
      <h1 className="text-2xl font-semibold text-stone-800 mb-1">Settings</h1>
      <p className="text-sm text-stone-400 mb-8">{user?.email}</p>

      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-xs uppercase tracking-widest text-stone-400">Translation</p>
          </div>
          {TRANSLATIONS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setTranslation(t.id)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                i < TRANSLATIONS.length - 1 ? "border-b border-stone-100" : ""
              } ${!loading && translation === t.id ? "bg-amber-50" : "hover:bg-stone-50"}`}
            >
              <span className={`text-sm ${!loading && translation === t.id ? "font-semibold text-amber-700" : "text-stone-700"}`}>
                {t.name}
              </span>
              {!loading && translation === t.id && (
                <span className="text-amber-500 text-sm">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-xs uppercase tracking-widest text-stone-400">Arabic Font</p>
          </div>
          {["Naskh", "Indopak", "Nastaliq"].map((category) => {
            const categoryFonts = FONTS.filter((f) => f.category === category);
            return (
              <div key={category}>
                <div className="px-4 py-2 bg-stone-50 border-b border-stone-100">
                  <p className="text-xs font-medium text-stone-400">{category}</p>
                </div>
                {categoryFonts.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setFont(f.id)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                      i < categoryFonts.length - 1 ? "border-b border-stone-100" : "border-b border-stone-100"
                    } ${!loading && font === f.id ? "bg-amber-50" : "hover:bg-stone-50"}`}
                  >
                    <div>
                      <span className={`text-sm ${!loading && font === f.id ? "font-semibold text-amber-700" : "text-stone-700"}`}>
                        {f.name}
                      </span>
                      <span className="text-stone-400 text-base ml-3" style={{ fontFamily: `var(${f.cssVar})` }}>بِسْمِ ٱللَّهِ</span>
                    </div>
                    {!loading && font === f.id && (
                      <span className="text-amber-500 text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <button
            onClick={signOut}
            className="w-full px-4 py-4 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
