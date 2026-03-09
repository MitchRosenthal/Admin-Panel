# Agent instructions and project documentation

**Before making any changes to this codebase, read this file.** Use it to understand structure, conventions, and the changelog so existing flows are not broken.

---

## 1. Overview

- **Project:** Admin Dashboard
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, pnpm, Supabase (Auth + Postgres)
- **Auth:** Supabase Auth with Google OAuth; session in **cookies** via `@supabase/ssr`.
- **Deployment:** Vercel (zero config); env vars required: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- **Protection:** No global middleware; admin routes are guarded per-layout via server-side `requireAdmin()` (user + `profiles.is_superadmin === true`).

---

## 2. Key file reference

| Purpose | File(s) |
|--------|---------|
| Server Supabase client | `lib/supabase/server.ts` |
| Browser Supabase client | `lib/supabase/client.ts` |
| Admin guard (user + profiles.is_superadmin) | `lib/auth.ts` |
| OAuth callback | `app/auth/callback/route.ts` |
| Sign out | `app/auth/signout/route.ts`, `components/LogoutButton.tsx` |
| Login page + Google sign-in | `app/login/page.tsx`, `app/login/LoginForm.tsx` |
| Admin layout (sidebar + guard) | `app/admin/layout.tsx` |
| Admin routes (placeholders) | `app/admin/page.tsx`, `app/admin/dashboard/page.tsx`, `app/admin/users/page.tsx`, `app/admin/images/page.tsx`, `app/admin/captions/page.tsx` |
| Local env (gitignored) | `.env.local` — set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Agent workflow / changelog | `AGENTS.md` (this file) |

---

## 3. Conventions

- **Path alias:** `@/` → project root (e.g. `@/lib/supabase/server`, `@/lib/auth`).
- **Supabase server:** `createClient()` is **async**; uses `await cookies()` from `next/headers`. Use only on the server (RSC, Route Handlers, Server Actions).
- **Supabase client:** `getSupabase()` returns a cached `createBrowserClient` from `@supabase/ssr` (cookie-based). Do **not** use plain `createClient` from `@supabase/supabase-js` (localStorage) or server/client session will diverge.
- **OAuth callback:** GET only; reads `?code`; `exchangeCodeForSession(code)`; redirect to **origin only** (no path/query). Do not change redirect target.
- **Admin guard:** `requireAdmin()` in `lib/auth.ts` — gets user, loads `profiles` by `id`, requires `profiles.is_superadmin === true`; otherwise `redirect("/login")`. Do not modify RLS; guard only reads session and profiles.
- **Changelog:** After making changes, add an entry at the **top** of the Changelog below (file, short description, date).

---

## 4. Routing and layout

- **`/`** → redirect to `/admin` if signed in, else `/login`.
- **`/login`** → if user exists, redirect to `/admin`; else render Google sign-in.
- **`/auth/callback`** → exchange code for session, redirect to origin.
- **`/admin`** → redirect to `/admin/dashboard`.
- **`/admin/*`** → layout runs `requireAdmin()`; sidebar: Dashboard, Users, Images, Captions; main content area for child routes.

---

## 5. Database (Supabase)

- **profiles:** Must have at least `id` (uuid, matches auth user), `is_superadmin` (boolean). Guard checks `is_superadmin === true`.
- RLS is not modified by this app; ensure policies allow the guard to read the current user’s profile as needed.

---

## 6. Vercel troubleshooting (works on localhost, fails on Vercel)

If auth works locally but not on Vercel, check the following.

**1. Supabase Dashboard → Authentication → URL Configuration**

- **Site URL:** Set to your production URL, e.g. `https://your-app.vercel.app` (no trailing slash).
- **Redirect URLs:** Add exactly:
  - `https://your-app.vercel.app/auth/callback`
  - (Keep `http://localhost:3000/auth/callback` for local dev.)

**2. Vercel project → Settings → Environment Variables**

- `NEXT_PUBLIC_SUPABASE_URL` = same as in `.env.local`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = same as in `.env.local`.
- Apply to Production (and Preview if you test preview URLs). Redeploy after changing.

**3. Google Cloud Console (if using Google OAuth)**

- In the OAuth 2.0 Client, **Authorized redirect URIs** must include Supabase’s callback, e.g. `https://<project-ref>.supabase.co/auth/v1/callback` (from Supabase Auth → Providers → Google). The app’s `/auth/callback` is called by Supabase after Google, not directly by Google.

**4. Code alignment with reference (Humor Study / transcript)**

- **Single cookie store in callback:** Callback gets `cookieStore` once, passes it to `createClient(cookieStore)`, then copies `cookieStore.getAll()` onto the redirect response so the same store Supabase wrote to is used for `Set-Cookie`. (Done.)
- **Explicit cookie options on redirect:** Response cookies use `path: "/"`, `httpOnly: true`, `sameSite: "lax"`, `secure: true` on HTTPS, and a `maxAge` so cookies persist. (Done.)
- **Node runtime for auth routes:** Callback and signout routes use `export const runtime = "nodejs"` so cookie behavior matches localhost. (Done.)

**5. Quick test**

- Open production URL in an incognito window → Sign in with Google → you should land on `/` (then redirect to `/admin` or see “Sorry, you do not have access”). If you land on `/login` with no error, the session cookie is not being set or sent; re-check steps 1–2 and that the callback runs without error (check Vercel function logs).

---

## 7. Changelog

Add new entries at the top. Format: `(YYYY-MM-DD) file_or_scope: short description`.

| Date | File / scope | Description |
|------|----------------|-------------|
| 2026-03-05 | app/auth/callback/route.ts, app/auth/signout/route.ts, AGENTS.md | Vercel: callback/signout use runtime = nodejs; callback sets maxAge on copied cookies; added §6 Vercel troubleshooting (Supabase URLs, env vars, Google OAuth, code alignment). |
| 2026-03-05 | app/auth/callback/route.ts, app/page.tsx | Callback redirects to explicit "/" (new URL("/", origin)); root page force-dynamic so unauthorized users always get "Sorry, you do not have access" when signed in but not admin. |
| 2026-03-05 | lib/supabase/server.ts, app/auth/callback/route.ts | OAuth callback: use single cookie store (pass to createClient) so session cookies written by exchangeCodeForSession are copied onto redirect response; createClient(cookieStore?) added. |
| 2026-03-05 | app/auth/signout/route.ts, app/login/page.tsx, lib/auth.ts, app/page.tsx | Sign out: clear cookies with httpOnly/sameSite/secure so browser drops session; login "Sign out" now &lt;a href&gt; for full page load; hardcoded admin email comparison made case-insensitive everywhere. |
| 2026-03-05 | app/login/page.tsx | Login: redirect to /admin only for admins (hardcoded email or is_superadmin); signed-in non-admins stay on login so "Back to login" works; show "Sign out" when signed in but no access. |
| 2026-03-05 | app/page.tsx | Unauthorized page: added "Back to login" button below message linking to /login. |
| 2026-03-05 | app/auth/signout/route.ts, components/LogoutButton.tsx, app/admin/layout.tsx | Added logout: signout route clears session and sb-* cookies then redirects to /login; LogoutButton in admin sidebar. |
| 2026-03-05 | app/auth/callback/route.ts, lib/auth.ts, app/login/page.tsx | Vercel redirect loop fix: callback now attaches session cookies to redirect response (Set-Cookie); added temp console logs for user/session (login) and user/profile (admin guard). |
| 2026-03-05 | app/page.tsx, lib/auth.ts | Non-admin landing: "Sorry, you do not have access." Hardcoded admin access for mr4431@columbia.edu in requireAdmin() and root redirect. |
| 2026-03-05 | lib/auth.ts, app/login/page.tsx, app/page.tsx | Fixed redirect loop: admin guard redirects non-superadmin to `/` (not `/login`); root page only redirects to `/admin` when profile.is_superadmin; added temporary debug logs on login and admin guard. |
| 2026-03-05 | .env.example → .env.local, AGENTS.md | Replaced `.env.example` with `.env.local` for local env vars; updated AGENTS.md file reference. |
| 2026-03-05 | AGENTS.md | Added agent instructions, file reference, conventions, and changelog. |
| 2026-03-05 | .gitignore, git history | Ensured `.pnpm-store` is ignored; removed `.pnpm-store` from git history to fix GitHub 100MB push error. |
| 2026-03-05 | — | Initial admin dashboard: Next.js 14, TypeScript, Tailwind, Supabase server/client, OAuth callback, `/login`, admin guard (`requireAdmin` + profiles.is_superadmin), `/admin` layout with sidebar, placeholder routes (dashboard, users, images, captions). |
