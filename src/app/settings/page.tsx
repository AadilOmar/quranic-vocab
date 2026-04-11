"use client";

import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { signOut, user } = useAuth();

  return (
    <div className="max-w-xl mx-auto px-4 py-10 pb-24">
      <h1 className="text-2xl font-semibold text-stone-800 mb-1">Settings</h1>
      <p className="text-sm text-stone-400 mb-8">{user?.email}</p>

      <div className="bg-white rounded-xl border border-stone-100 shadow-sm overflow-hidden">
        <button
          onClick={signOut}
          className="w-full px-4 py-4 text-left text-sm text-red-500 hover:bg-red-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
