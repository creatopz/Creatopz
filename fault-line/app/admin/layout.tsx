import Link from "next/link";
import { requireStaff } from "@/lib/admin";

const NAV = [
  { href: "/admin", label: "DASHBOARD" },
  { href: "/admin/users", label: "USERS" },
  { href: "/admin/posts", label: "POSTS" },
  { href: "/admin/communities", label: "COMMUNITIES" },
  { href: "/admin/reports", label: "REPORTS" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = await requireStaff();

  return (
    <div className="min-h-screen bg-ink text-paper">
      <header className="flex items-center justify-between border-b-2 border-paper/20 px-6 py-4">
        <div className="flex items-center gap-8">
          <p className="font-mono text-xs uppercase tracking-widest">FL_ADMIN // {role}</p>
          <nav className="hidden gap-5 font-mono text-[11px] uppercase tracking-widest md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="text-paper/70 hover:text-acid">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <Link href="/cracks" className="font-mono text-[10px] uppercase tracking-widest text-paper/50 hover:text-paper">
          exit admin →
        </Link>
      </header>
      <div className="flex gap-4 overflow-x-auto border-b border-paper/10 px-6 py-2 font-mono text-[10px] uppercase tracking-widest md:hidden">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="whitespace-nowrap text-paper/70">
            {n.label}
          </Link>
        ))}
      </div>
      <main className="px-6 py-8">{children}</main>
    </div>
  );
}
