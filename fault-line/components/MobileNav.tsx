"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  { href: "/cracks", label: "CRACKS", icon: "▦" },
  { href: "/cracks/new", label: "DROP", icon: "+" },
  { href: "/communities", label: "FIND", icon: "◎" },
  { href: "/profile/me", label: "ME", icon: "☺" },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-ink bg-paper md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Primary"
    >
      {ITEMS.map((item) => {
        const active = pathname === item.href;
        const isDrop = item.href === "/cracks/new";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 font-mono text-[9px] uppercase tracking-widest ${
              isDrop ? "bg-crack text-paper" : active ? "text-crack" : "text-ink"
            }`}
          >
            <span className="text-lg leading-none" aria-hidden>
              {item.icon}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
