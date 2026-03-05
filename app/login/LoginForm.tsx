"use client";

import { getSupabase } from "@/lib/supabase/client";
import { useState } from "react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    const supabase = getSupabase();
    if (!supabase) {
      setError("Supabase is not configured.");
      return;
    }
    setError(null);
    setLoading(true);
    const { data, error: signInError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    if (data?.url) {
      window.location.href = data.url;
    } else {
      setError("No redirect URL from sign-in. Check Supabase Google provider and redirect URL.");
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded bg-red-50 p-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        {loading ? "Redirecting…" : "Sign in with Google"}
      </button>
    </div>
  );
}
