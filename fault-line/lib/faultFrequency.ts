export type FaultFrequencyQuestion = {
  id: string;
  prompt: string;
  options: { key: string; label: string }[];
};

export const FAULT_FREQUENCY_QUESTIONS: FaultFrequencyQuestion[] = [
  {
    id: "mistake",
    prompt: "When you make a mistake, do you:",
    options: [
      { key: "A", label: "Forget it immediately" },
      { key: "B", label: "Think about it for 6 years" },
      { key: "C", label: "Move to another country" },
    ],
  },
  {
    id: "silence",
    prompt: "A conversation goes quiet. You:",
    options: [
      { key: "A", label: "Fill it with a joke nobody asked for" },
      { key: "B", label: "Replay the last 10 minutes for flaws" },
      { key: "C", label: "Become one with the silence" },
    ],
  },
  {
    id: "compliment",
    prompt: "Someone compliments you. Internally:",
    options: [
      { key: "A", label: "Thank you, I know" },
      { key: "B", label: "They're lying, but okay" },
      { key: "C", label: "System error. Reboot required." },
    ],
  },
  {
    id: "plans",
    prompt: "Plans get cancelled. You feel:",
    options: [
      { key: "A", label: "Devastated, I had a whole outfit" },
      { key: "B", label: "Relief, then guilt about the relief" },
      { key: "C", label: "Nothing. I forgot I had plans." },
    ],
  },
  {
    id: "text",
    prompt: "You sent a text 4 hours ago. No reply. You:",
    options: [
      { key: "A", label: "Already drafted three apologies for nothing" },
      { key: "B", label: "Completely forgot you sent it" },
      { key: "C", label: "Are drafting a follow-up right now" },
    ],
  },
];

/**
 * Turns raw answers (question id -> option key) into a small "frequency"
 * signature used to cluster people into communities/matches. Deliberately
 * simple — this is a vibe-finder, not a clinical instrument.
 */
export function faultFrequencySignature(answers: Record<string, string>): string {
  const values = Object.values(answers);
  const counts: Record<string, number> = {};
  for (const v of values) counts[v] = (counts[v] ?? 0) + 1;
  const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "B";
  return dominant;
}

/** Maps a dominant signature letter to the community slugs most likely to fit. */
export const SIGNATURE_COMMUNITIES: Record<string, string[]> = {
  A: ["socially-awkward-association", "chronic-people-pleasers"],
  B: ["overthinking-department", "2am-thought-club", "quiet-people-loud-minds"],
  C: ["dont-know-what-im-doing", "2am-thought-club"],
};

export const SIGNATURE_LABELS: Record<string, string> = {
  A: "THE DEFLECTOR",
  B: "THE OVERTHINKER",
  C: "THE AVOIDANT CHAOS AGENT",
};
