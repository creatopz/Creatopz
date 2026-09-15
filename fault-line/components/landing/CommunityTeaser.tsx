import Link from "next/link";

const PREVIEW = [
  { icon: "◈", name: "THE OVERTHINKING DEPARTMENT", desc: "8,492 humans currently spiraling." },
  { icon: "▦", name: "SOCIALLY AWKWARD ASSOCIATION", desc: "Nobody knows how to start the conversation." },
  { icon: "☾", name: "2AM THOUGHT CLUB", desc: "Open when your brain refuses to sleep." },
];

export default function CommunityTeaser() {
  return (
    <section className="border-y-2 border-ink bg-paper px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-[10px] uppercase tracking-widest text-crack">[ FIND YOUR WEIRD ]</p>
        <h2 className="mt-3 font-grotesk text-huge font-black uppercase leading-[0.9]">
          A corner of the internet
          <br />
          that gets it.
        </h2>
        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {PREVIEW.map((c) => (
            <div key={c.name} className="border-2 border-ink p-5 shadow-[4px_4px_0_#111]">
              <span className="text-2xl">{c.icon}</span>
              <p className="mt-3 font-grotesk text-lg font-black uppercase leading-tight">{c.name}</p>
              <p className="mt-2 text-sm text-ink/70">{c.desc}</p>
            </div>
          ))}
        </div>
        <Link
          href="/communities"
          data-cursor="CLICK"
          className="mt-10 inline-block border-2 border-ink px-6 py-3 font-mono text-xs uppercase tracking-widest hover:bg-ink hover:text-paper"
        >
          EXPLORE ALL COMMUNITIES →
        </Link>
      </div>
    </section>
  );
}
