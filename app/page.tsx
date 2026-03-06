import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HARDCODED_ADMIN_EMAIL } from "@/lib/auth";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.email === HARDCODED_ADMIN_EMAIL) {
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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-center text-lg text-gray-600 dark:text-gray-400">
        Sorry, you do not have access.
      </p>
    </div>
  );
}
