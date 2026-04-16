"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useSettings, TRANSLATIONS, FONTS } from "@/hooks/useSettings";

export default function SettingsPage() {
  const { signOut, user } = useAuth();
  const { translation, setTranslation, font, setFont, loading } = useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="max-w-xl mx-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-100 px-4 h-16 flex items-center justify-between">
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">Settings</h1>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 transition-colors"
          >
            <span className="truncate max-w-[160px]">{user?.email}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 transition-transform ${menuOpen ? "rotate-180" : ""}`}><polyline points="6 9 12 15 18 9"/></svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white border border-stone-100 rounded-xl shadow-lg overflow-hidden z-20">
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-6 pb-24">
      <div className="space-y-4">
        <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100">
            <p className="text-sm font-bold text-stone-900">Translation</p>
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
            <p className="text-sm font-bold text-stone-900">Arabic Font</p>
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

      </div>
      </div>
    </div>
  );
}
