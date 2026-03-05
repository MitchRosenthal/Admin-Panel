import { createBrowserClient } from "@supabase/ssr";

let cached: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase(): ReturnType<typeof createBrowserClient> | null {
  if (cached !== null) return cached;
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim().replace(/\s/g, "");
  const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim().replace(/\s/g, "");
  if (!url || !key) return null;
  cached = createBrowserClient(url, key);
  return cached;
}
