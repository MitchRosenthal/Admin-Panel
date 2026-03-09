import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HARDCODED_ADMIN_EMAIL } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
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
    // Signed in but not admin: show login page so "Back to login" works (no redirect loop)
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-xl font-semibold">Admin Dashboard</h1>
        {user && (
          <p className="mb-4 text-center text-sm text-gray-600 dark:text-gray-400">
            Signed in as {user.email}. You don&apos;t have admin access.{" "}
            <a href="/auth/signout" className="font-medium underline">
              Sign out
            </a>{" "}
            to use another account.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
