"use client";

import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email: string, password: string) =>
    getSupabase().auth.signUp({ email, password });

  const signIn = (email: string, password: string) =>
    getSupabase().auth.signInWithPassword({ email, password });

  const signOut = () => getSupabase().auth.signOut();

  return { user, loading, signUp, signIn, signOut };
}
