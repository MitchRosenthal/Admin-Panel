import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { LogoutButton } from "@/components/LogoutButton";

const nav = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/images", label: "Images" },
  { href: "/admin/captions", label: "Captions" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
        <div className="p-4">
          <Link
            href="/admin"
            className="block text-lg font-semibold text-gray-900 dark:text-white"
          >
            Admin
          </Link>
        </div>
        <nav className="space-y-0.5 px-2 pb-4">
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {label}
            </Link>
          ))}
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-2">
            <LogoutButton />
          </div>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
