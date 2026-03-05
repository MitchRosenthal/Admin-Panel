import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export type AdminProfile = {
  id: string;
  is_superadmin: boolean;
  [key: string]: unknown;
};

/**
 * Server-side guard for admin routes.
 * 1. Retrieves the logged-in user from Supabase
 * 2. Queries the profiles table
 * 3. Checks profiles.is_superadmin === true
 * 4. Redirects non-admin users to /login
 * @returns { user, profile } for use in the page, or redirects
 */
export async function requireAdmin(): Promise<{ user: User; profile: AdminProfile }> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    redirect("/login");
  }

  if (profile.is_superadmin !== true) {
    redirect("/login");
  }

  return { user, profile: profile as AdminProfile };
}
