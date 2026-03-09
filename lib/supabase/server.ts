import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createClient(cookieStore?: CookieStore) {
  const store = cookieStore ?? (await cookies());
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return store.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              const opts = options && typeof options === "object" ? { ...options } : {};
              delete (opts as Record<string, unknown>).name;
              store.set(name, value, opts);
            });
          } catch {
            // Cookies read-only during Server Component render; ignore.
          }
        },
      },
    }
  );
}
