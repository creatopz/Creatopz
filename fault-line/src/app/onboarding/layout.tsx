import Link from "next/link";
import { Wordmark } from "@/components/landing/Wordmark";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 md:px-10 py-6 flex items-center justify-between">
        <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
          <Wordmark size="text-lg" />
        </Link>
        <p className="sys text-[11px] opacity-50">BUILDING YOUR MASK</p>
      </header>
      <main className="flex-1 px-5 md:px-10 pb-16">
        <div className="mx-auto max-w-[860px]">{children}</div>
      </main>
    </div>
  );
}
