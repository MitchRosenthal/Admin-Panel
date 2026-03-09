"use client";

import { getSupabase } from "@/lib/supabase/client";

export function LogoutButton() {
  async function handleLogout() {
    const supabase = getSupabase();
    if (supabase) {
      await supabase.auth.signOut();
    }
    window.location.href = "/auth/signout";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      Log out
    </button>
  );
}
