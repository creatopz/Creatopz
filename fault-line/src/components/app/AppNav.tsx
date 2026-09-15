"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/landing/Wordmark";
import { SoundToggle } from "@/components/landing/SoundToggle";
import type { AvatarConfig } from "@/types/database";
import type { Expression } from "@/lib/avatar";
import { AvatarRenderer } from "@/components/avatar/AvatarRenderer";

const LINKS = [
  { href: "/feed", label: "FEED" },
  { href: "/zones", label: "FAULT ZONES" },
  { href: "/account", label: "ACCOUNT" },
];

export function AppNav({
  username,
  avatarConfig,
  expression,
}: {
  username: string;
  avatarConfig: AvatarConfig;
  expression: Expression;
}) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-ink/15 bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto max-w-[1200px] px-5 md:px-8 h-16 flex items-center justify-between">
        <Link href="/feed">
          <Wordmark size="text-lg" />
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`sys text-[12px] hover:text-red transition-colors ${
                pathname?.startsWith(l.href) ? "text-red" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <SoundToggle />
          <Link href="/account" className="flex items-center gap-2 border border-ink/25 px-2 py-1 hover:border-ink transition-colors">
            <AvatarRenderer config={avatarConfig} expression={expression} size={28} />
            <span className="sys text-[11px] hidden md:inline">{username}</span>
          </Link>
          <form action="/auth/sign-out" method="post">
            <button type="submit" className="sys text-[11px] opacity-50 hover:opacity-100">
              EXIT
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
