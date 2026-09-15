import Link from "next/link";
import FaultLogo from "@/components/FaultLogo";

export default function AuthShell({
  eyebrow,
  title,
  children,
  footer,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-paper px-6 py-8">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10">
          <FaultLogo />
        </div>
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">{eyebrow}</p>
        <h1 className="mt-2 font-grotesk text-3xl font-black leading-tight text-ink">{title}</h1>
        <div className="mt-8">{children}</div>
        {footer && <div className="mt-6 font-mono text-[11px] text-grey">{footer}</div>}
      </div>
      <div className="mx-auto mt-12 w-full max-w-sm">
        <Link href="/" className="font-mono text-[10px] uppercase tracking-widest text-grey hover:text-ink">
          ← back to fault line
        </Link>
      </div>
    </div>
  );
}
