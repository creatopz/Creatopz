// Lightweight, client-side first-pass detector for content that may indicate
// immediate risk of self-harm. This is NOT a substitute for real moderation —
// it exists to interrupt the posting flow with support resources before the
// content ever reaches the network, and every flagged post is also queued
// for human review server-side (see app/api/posts/route.ts).
const RISK_PATTERNS = [
  /\bkill myself\b/i,
  /\bend it all\b/i,
  /\bwant to die\b/i,
  /\bsuicid/i,
  /\bself[- ]?harm/i,
  /\bhurt myself\b/i,
  /\bno reason to live\b/i,
  /\bcan'?t go on\b/i,
];

export function detectRiskSignal(text: string): boolean {
  return RISK_PATTERNS.some((re) => re.test(text));
}

export const SAFETY_RESOURCES: { region: string; name: string; contact: string }[] = [
  { region: "India", name: "iCall (TISS)", contact: "9152987821" },
  { region: "India", name: "AASRA", contact: "+91 9820466726" },
  { region: "International", name: "Befrienders Worldwide", contact: "befrienders.org" },
  { region: "USA", name: "988 Suicide & Crisis Lifeline", contact: "988" },
];
