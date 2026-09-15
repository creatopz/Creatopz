import type { Metadata } from "next";
import { CRISIS_RESOURCES } from "@/lib/safety";

export const metadata: Metadata = { title: "Safety" };

export default function SafetyPage() {
  return (
    <div className="px-5 md:px-10 py-16 md:py-24">
      <div className="mx-auto max-w-[720px]">
        <p className="sys text-xs opacity-60 mb-3">REPORTING &amp; CRISIS RESOURCES</p>
        <h1 className="font-grotesk font-black uppercase text-huge mb-10">IF SOMETHING&apos;S WRONG.</h1>

        <section className="mb-14">
          <h2 className="font-grotesk font-black uppercase text-xl mb-3">REPORT A POST OR USER</h2>
          <p className="opacity-80 max-w-[60ch]">
            Every post has a small &quot;report&quot; link. Reports go straight into our moderation queue and are
            reviewed by a human — never auto-resolved. We also run a lightweight automatic check for
            crisis-sounding language, which opens a review item and shows the poster crisis resources immediately;
            it never hides or blocks a post by itself.
          </p>
        </section>

        <section>
          <h2 className="font-grotesk font-black uppercase text-xl mb-3">IF YOU&apos;RE STRUGGLING RIGHT NOW</h2>
          <p className="opacity-80 max-w-[60ch] mb-5">
            Fault Line is a place to be honest — it is not a crisis service and no one here is monitoring in
            real time. If you&apos;re in danger or thinking about harming yourself, please reach one of these:
          </p>
          <ul className="flex flex-col gap-3">
            {CRISIS_RESOURCES.map((r) => (
              <li key={r.name} className="border border-ink/20 p-4">
                <p className="font-grotesk font-black uppercase text-sm">{r.name}</p>
                <p className="sys text-xs opacity-60 mt-1">
                  {r.region} · <a href={r.contact} className="underline underline-offset-2">{r.contact.replace(/^tel:/, "")}</a> ·{" "}
                  {r.note}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
