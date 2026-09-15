import type { Metadata } from "next";

export const metadata: Metadata = { title: "Community Guidelines" };

const RULES = [
  {
    title: "This is honesty, not a weapon.",
    body: "Say the true, hidden thing about yourself. Don't use anonymity to attack, harass, or humiliate someone else — named or not.",
  },
  {
    title: "No real identifying information.",
    body: "Don't post anyone's real name, address, phone number, workplace, or anything that could unmask you or someone else.",
  },
  {
    title: "No hate.",
    body: "Nothing targeting race, religion, gender, sexuality, disability, or any protected group. Zero tolerance.",
  },
  {
    title: "No sexual content involving minors, ever.",
    body: "Reported immediately, permanently banned, referred to authorities where legally required.",
  },
  {
    title: "If you're in crisis, we'll try to help — but we're not a hotline.",
    body: "Fault Line surfaces crisis resources when a post looks like it needs them. Please also reach a real person: a helpline, a friend, emergency services.",
  },
  {
    title: "Spam, scams, and self-promotion get removed.",
    body: "This isn't a marketing channel. Keep it human.",
  },
];

export default function GuidelinesPage() {
  return (
    <div className="px-5 md:px-10 py-16 md:py-24">
      <div className="mx-auto max-w-[800px]">
        <p className="sys text-xs opacity-60 mb-3">THE RULES</p>
        <h1 className="font-grotesk font-black uppercase text-huge mb-14">COMMUNITY GUIDELINES.</h1>

        <div className="flex flex-col gap-10">
          {RULES.map((r, i) => (
            <div key={r.title} className="border-t border-ink/15 pt-6">
              <p className="sys text-xs opacity-40 mb-2">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="font-grotesk font-black uppercase text-xl mb-2">{r.title}</h2>
              <p className="opacity-75 max-w-[60ch]">{r.body}</p>
            </div>
          ))}
        </div>

        <p className="sys text-xs opacity-50 mt-14">
          BREAKING THESE GETS YOUR CONTENT REMOVED, AND REPEATEDLY OR SEVERELY BREAKING THEM GETS YOUR ACCOUNT
          SUSPENDED OR BANNED. REPORT ANYTHING THAT CROSSES A LINE — WE READ EVERY REPORT.
        </p>
      </div>
    </div>
  );
}
