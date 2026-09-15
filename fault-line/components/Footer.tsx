import Link from "next/link";
import FaultLogo from "@/components/FaultLogo";

export default function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-paper px-6 py-10 pb-28 md:pb-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
        <FaultLogo size="sm" />
        <nav className="flex flex-wrap justify-center gap-5 font-mono text-[10px] uppercase tracking-widest text-grey">
          <Link href="/how-it-works" className="hover:text-ink">
            How it works
          </Link>
          <Link href="/communities" className="hover:text-ink">
            Communities
          </Link>
          <Link href="/pricing" className="hover:text-ink">
            Pricing
          </Link>
          <Link href="/safety" className="hover:text-ink">
            Safety
          </Link>
          <Link href="/privacy" className="hover:text-ink">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-ink">
            Terms
          </Link>
        </nav>
        <p className="font-mono text-[10px] uppercase tracking-widest text-grey">
          © {new Date().getFullYear()} FAULT LINE
        </p>
      </div>
    </footer>
  );
}
