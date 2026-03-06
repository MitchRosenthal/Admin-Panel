import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const HARDCODED_ADMIN_EMAIL = "mr4431@columbia.edu";

export type AdminProfile = {
  id: string;
  is_superadmin: boolean;
  [key: string]: unknown;
};

/**
 * Server-side guard for admin routes.
 * 1. Retrieves the logged-in user from Supabase
 * 2. Hardcoded: mr4431@columbia.edu is always granted access
 * 3. Otherwise queries profiles and requires profiles.is_superadmin === true
 * 4. Redirects non-admin users to /
 */
export async function requireAdmin(): Promise<{ user: User; profile: AdminProfile }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("[admin guard] user:", user ? { id: user.id, email: user.email } : null);

  if (userError || !user) {
    redirect("/login");
  }

  if (user.email === HARDCODED_ADMIN_EMAIL) {
    return {
      user,
      profile: { id: user.id, is_superadmin: true } as AdminProfile,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  console.log("[admin guard] profile:", profile ?? null, "profileError:", profileError?.message ?? null);

  if (profileError || !profile) {
    redirect("/");
  }

  if (profile.is_superadmin !== true) {
    redirect("/");
  }

  return { user, profile: profile as AdminProfile };
}
