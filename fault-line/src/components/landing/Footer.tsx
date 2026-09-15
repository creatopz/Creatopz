import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function Footer() {
  return (
    <footer className="border-t border-ink/15 mt-20">
      <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-14 grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <Wordmark size="text-2xl" />
          <p className="sys mt-4 text-xs max-w-[26ch] opacity-70">
            A PLACE FOR THE VERSION OF YOU THAT DOESN&apos;T FIT IN THE FEED.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="sys text-[11px] opacity-50 mb-1">PLATFORM</p>
          <a href="/#confess" className="text-sm hover:text-red w-fit">Explore</a>
          <a href="/#how-it-works" className="text-sm hover:text-red w-fit">How it works</a>
          <a href="/#fault-zones" className="text-sm hover:text-red w-fit">Fault Zones</a>
          <Link href="/pricing" className="text-sm hover:text-red w-fit">Pricing</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="sys text-[11px] opacity-50 mb-1">ACCOUNT</p>
          <Link href="/auth/sign-up" className="text-sm hover:text-red w-fit">Create account</Link>
          <Link href="/auth/log-in" className="text-sm hover:text-red w-fit">Log in</Link>
          <Link href="/account" className="text-sm hover:text-red w-fit">Subscription status</Link>
        </div>

        <div className="flex flex-col gap-2">
          <p className="sys text-[11px] opacity-50 mb-1">SAFETY</p>
          <Link href="/guidelines" className="text-sm hover:text-red w-fit">Community guidelines</Link>
          <Link href="/privacy" className="text-sm hover:text-red w-fit">Privacy</Link>
          <Link href="/safety" className="text-sm hover:text-red w-fit">Report / crisis resources</Link>
        </div>
      </div>
      <div className="border-t border-ink/15">
        <div className="mx-auto max-w-[1600px] px-5 md:px-10 py-5 flex flex-wrap items-center justify-between gap-3">
          <p className="sys text-[10px] opacity-50">© {new Date().getFullYear()} FAULT LINE. EVERY HUMAN HAS ONE.</p>
          <p className="sys text-[10px] opacity-50">NO REAL NAME REQUIRED.</p>
        </div>
      </div>
    </footer>
  );
}
