import Link from "next/link";
import { Wordmark } from "@/components/landing/Wordmark";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 md:px-10 py-6">
        <Link href="/" className="inline-block hover:opacity-70 transition-opacity">
          <Wordmark size="text-lg" />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[440px]">{children}</div>
      </main>
      <footer className="px-5 md:px-10 py-6">
        <p className="sys text-[10px] opacity-45 text-center">
          NO REAL NAME REQUIRED. NO PERFECT PHOTO REQUIRED.
        </p>
      </footer>
    </div>
  );
}
