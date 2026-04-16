"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import BottomNav from "@/components/BottomNav";


export default function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, loading, signIn, signUp, signOut, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [signupDone, setSignupDone] = useState(false);

  if (pathname === "/privacy" || pathname === "/about") return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setSubmitting(true);

      if (mode === "signup") {
        const { error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else {
          setSignupDone(true);
        }
        setSubmitting(false);
      } else {
        const { error } = await signIn(email, password);
        if (error) { setError(error.message); setSubmitting(false); }
        else { window.location.href = "/"; }
      }
    };

    if (signupDone) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen px-6 gap-4">
          <p className="text-2xl">📬</p>
          <p className="text-stone-700 font-semibold">Check your email</p>
          <p className="text-stone-400 text-sm text-center">
            We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account, then sign in.
          </p>
          <button
            onClick={() => { setSignupDone(false); setMode("signin"); }}
            className="text-sm text-amber-600 hover:underline mt-2"
          >
            Back to sign in
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center mx-auto mb-3">
              <span className="font-arabic text-white text-2xl leading-none">ق</span>
            </div>
            <h1 className="text-xl font-semibold text-stone-800">Quran Vocabulary</h1>
            <p className="text-sm text-stone-400 mt-1">
              {mode === "signin" ? "Sign in to your account" : "Create an account"}
            </p>
          </div>

          <button
            onClick={() => signInWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"/><path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"/></svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm text-stone-700 placeholder-stone-300 focus:outline-none focus:border-amber-400"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-amber-500 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 disabled:opacity-50 transition-colors"
            >
              {submitting ? "..." : mode === "signin" ? "Sign In" : "Create Account"}
            </button>
          </form>

          <p className="text-center text-sm text-stone-400 mt-5">
            {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(""); }}
              className="text-amber-600 hover:underline font-medium"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
        <div className="text-center mt-10 flex justify-center gap-4">
          <Link href="/about" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">About</Link>
          <Link href="/privacy" className="text-xs text-stone-400 hover:text-amber-600 transition-colors">Privacy Policy</Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pb-16">
        {children}
      </div>
      <BottomNav />
    </>
  );
}
