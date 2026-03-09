import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HARDCODED_ADMIN_EMAIL } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email?.toLowerCase() === HARDCODED_ADMIN_EMAIL.toLowerCase()) {
    redirect("/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_superadmin")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_superadmin === true) {
    redirect("/admin");
  }

  // Signed in but not admin → show unauthorized message (no redirect)
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <p className="text-center text-lg text-gray-600 dark:text-gray-400">
        Sorry, you do not have access.
      </p>
      <Link
        href="/login"
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
      >
        Back to login
      </Link>
    </div>
  );
}
