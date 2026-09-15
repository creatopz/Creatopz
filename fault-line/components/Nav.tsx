"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FaultLogo from "@/components/FaultLogo";
import PixelAvatar from "@/components/PixelAvatar";
import { AvatarConfig } from "@/lib/types";

export default function Nav({
  isAuthed,
  avatarConfig,
}: {
  isAuthed: boolean;
  avatarConfig?: AvatarConfig | null;
}) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 hidden w-full border-b-2 border-ink bg-paper/95 backdrop-blur transition-all duration-300 md:block ${
        compact ? "py-1.5" : "py-3"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6">
        {compact ? (
          <Link href="/" className="font-mono text-xs uppercase tracking-widest text-ink">
            FL_ // HUMAN NETWORK
          </Link>
        ) : (
          <FaultLogo />
        )}
        <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest">
          <Link href="/communities" data-cursor="CLICK" className="hover:text-crack">
            Explore
          </Link>
          <Link href="/how-it-works" data-cursor="CLICK" className="hover:text-crack">
            How it works
          </Link>
          <Link href="/pricing" data-cursor="CLICK" className="hover:text-crack">
            Pricing
          </Link>
          {isAuthed ? (
            <Link href="/profile/me" data-cursor="CLICK" className="flex items-center gap-2">
              {avatarConfig && <PixelAvatar config={avatarConfig} size={24} />}
              PROFILE
            </Link>
          ) : (
            <Link
              href="/auth/login"
              data-cursor="CLICK"
              className="border-2 border-ink bg-ink px-3 py-1.5 text-paper hover:bg-crack hover:border-crack"
            >
              ENTER &gt;
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
