import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function getRedirectOrigin(request: Request): string {
  const url = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedHost) {
    const protocol = forwardedProto === "https" ? "https" : "http";
    return `${protocol}://${forwardedHost}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return url.origin;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const cookieStore = await cookies();
  if (code) {
    const supabase = await createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] exchangeCodeForSession error:", error.message);
    }
  }

  const origin = getRedirectOrigin(request);
  const response = NextResponse.redirect(new URL("/", origin));
  const isSecure = origin.startsWith("https:");
  const all = cookieStore.getAll();
  for (const cookie of all) {
    response.cookies.set(cookie.name, cookie.value, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: isSecure,
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return response;
}
