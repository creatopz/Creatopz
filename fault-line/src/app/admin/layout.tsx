import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";
import { Wordmark } from "@/components/landing/Wordmark";

const LINKS = [
  { href: "/admin", label: "DASHBOARD" },
  { href: "/admin/moderation", label: "MODERATION" },
  { href: "/admin/zones", label: "FAULT ZONES" },
  { href: "/admin/users", label: "USERS" },
  { href: "/admin/analytics", label: "ANALYTICS" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireAdmin();
  // deliberately 404, not a redirect to /auth — an admin route should not
  // even confirm it exists to someone who isn't allowed in it.
  if (!ctx) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-paper2">
      <header className="border-b border-ink/20 bg-ink text-paper">
        <div className="mx-auto max-w-[1400px] px-5 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin">
              <Wordmark size="text-base" className="text-paper" />
            </Link>
            <span className="sys text-[10px] opacity-50">ADMIN</span>
          </div>
          <nav className="hidden md:flex items-center gap-5">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="sys text-[11px] hover:text-acid transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <span className="sys text-[10px] opacity-60">{ctx.profile.anonymous_username}</span>
            <form action="/auth/sign-out" method="post">
              <button type="submit" className="sys text-[11px] opacity-60 hover:opacity-100">
                EXIT
              </button>
            </form>
          </div>
        </div>
        <nav className="md:hidden flex overflow-x-auto gap-4 px-5 pb-3">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="sys text-[11px] whitespace-nowrap opacity-80">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="flex-1 px-5 md:px-8 py-10">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
