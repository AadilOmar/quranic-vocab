"use client";

import { useState, useEffect, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const wasLoggedOut = useRef(false);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) wasLoggedOut.current = true;
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null;
      if (wasLoggedOut.current && newUser) {
        wasLoggedOut.current = false;
        window.location.href = "/";
        return;
      }
      if (!newUser) wasLoggedOut.current = true;
      setUser(newUser);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email: string, password: string) =>
    getSupabase().auth.signUp({ email, password });

  const signIn = (email: string, password: string) =>
    getSupabase().auth.signInWithPassword({ email, password });

  const signOut = () => getSupabase().auth.signOut();

  const signInWithGoogle = () =>
    getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });

  return { user, loading, signUp, signIn, signOut, signInWithGoogle };
}
