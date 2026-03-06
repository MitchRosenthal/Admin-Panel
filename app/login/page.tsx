import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./LoginForm";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // DEBUG: remove after fixing redirect loop
  console.log("[login] user:", user ? { id: user.id, email: user.email } : null);
  console.log("[login] session:", session ? "present" : null);

  if (user) {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-8 shadow dark:border-gray-700 dark:bg-gray-800">
        <h1 className="mb-6 text-center text-xl font-semibold">Admin Dashboard</h1>
        <LoginForm />
      </div>
    </div>
  );
}
