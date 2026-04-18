"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { getSupabase } from "@/lib/supabase";

const ADMIN_EMAIL = "aadilomar1@gmail.com";

type Stats = {
  total_users: number;
  active_users: number;
  total_lists: number;
  total_words: number;
  words_known: number;
  new_users_7d: { day: string; count: number }[] | null;
  new_words_7d: { day: string; count: number }[] | null;
  top_words: { arabic: string; meaning: string; saves: number }[] | null;
  top_users_7d: { email: string; words_saved: number }[] | null;
};

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4">
      <p className="text-xs text-stone-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-stone-900 mt-1">{value}</p>
    </div>
  );
}

function MiniBar({ day, count, max }: { day: string; count: number; max: number }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-stone-500 font-medium">{count}</span>
      <div className="w-7 bg-stone-100 rounded-full overflow-hidden" style={{ height: 48 }}>
        <div
          className="w-full bg-amber-400 rounded-full transition-all"
          style={{ height: `${pct}%`, marginTop: `${100 - pct}%` }}
        />
      </div>
      <span className="text-xs text-stone-400">{new Date(day).toLocaleDateString("en", { weekday: "short" })}</span>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user || user.email !== ADMIN_EMAIL) return;
    getSupabase()
      .rpc("get_admin_stats")
      .then(({ data, error }) => {
        if (error) { setError(error.message); return; }
        setStats(data as Stats);
      });
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || user.email !== ADMIN_EMAIL) return notFound();

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const maxUsers = Math.max(...(stats.new_users_7d ?? []).map((d) => d.count), 1);
  const maxWords = Math.max(...(stats.new_words_7d ?? []).map((d) => d.count), 1);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
        <p className="text-sm text-stone-400 mt-0.5">quranvocab.org</p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="Active Users" value={stats.active_users} />
        <StatCard label="Lists Created" value={stats.total_lists} />
        <StatCard label="Words Saved" value={stats.total_words} />
        <StatCard label="Words Known" value={stats.words_known} />
        <StatCard label="Known Rate" value={stats.total_words > 0 ? `${Math.round((stats.words_known / stats.total_words) * 100)}%` : "—"} />
      </div>

      {/* New users last 7 days */}
      {stats.new_users_7d && stats.new_users_7d.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4 mb-4">
          <p className="text-sm font-semibold text-stone-800 mb-4">New Users — Last 7 Days</p>
          <div className="flex items-end justify-around">
            {stats.new_users_7d.map((d) => (
              <MiniBar key={d.day} day={d.day} count={d.count} max={maxUsers} />
            ))}
          </div>
        </div>
      )}

      {/* New words last 7 days */}
      {stats.new_words_7d && stats.new_words_7d.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4 mb-4">
          <p className="text-sm font-semibold text-stone-800 mb-4">Words Saved — Last 7 Days</p>
          <div className="flex items-end justify-around">
            {stats.new_words_7d.map((d) => (
              <MiniBar key={d.day} day={d.day} count={d.count} max={maxWords} />
            ))}
          </div>
        </div>
      )}

      {/* Top users last 7 days */}
      {stats.top_users_7d && stats.top_users_7d.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4 mb-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">Most Active Users — Last 7 Days</p>
          <div className="space-y-2">
            {stats.top_users_7d.map((u, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-stone-300 w-4 text-right">{i + 1}</span>
                <span className="text-sm text-stone-600 flex-1">{u.email}</span>
                <span className="text-xs font-semibold text-amber-600">{u.words_saved} words</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top words */}
      {stats.top_words && stats.top_words.length > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 px-5 py-4">
          <p className="text-sm font-semibold text-stone-800 mb-3">Most Saved Words</p>
          <div className="space-y-2">
            {stats.top_words.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-stone-300 w-4 text-right">{i + 1}</span>
                <span className="font-arabic text-xl text-stone-800 w-12 text-right">{w.arabic}</span>
                <span className="text-sm text-stone-500 flex-1">{w.meaning}</span>
                <span className="text-xs font-semibold text-amber-600">{w.saves} saves</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
