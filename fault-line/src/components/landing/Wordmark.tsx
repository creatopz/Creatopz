import { cx } from "@/lib/utils";

/**
 * FAULT//LINE wordmark. Two halves separated by a jagged double-slash,
 * built to read as a crack cutting through the type rather than a
 * decorative glyph.
 */
export function Wordmark({ size = "text-xl", className }: { size?: string; className?: string }) {
  return (
    <span className={cx("inline-flex items-baseline font-grotesk font-black uppercase tracking-tight", size, className)}>
      <span>FAULT</span>
      <span className="mx-[0.06em] text-red translate-y-[-0.05em] inline-block">//</span>
      <span>LINE</span>
    </span>
  );
}
