/**
 * Extremely lightweight, deliberately conservative crisis-language check.
 * This is NOT a moderation gate — a match never blocks or hides a post.
 * It only (a) surfaces crisis resources back to the poster immediately and
 * (b) opens a report in the moderation queue so a human looks at it soon.
 * A real deployment should replace/augment this with a proper classifier;
 * this exists so the workflow (detect → resource → human review) is real
 * end-to-end rather than a stub.
 */
const CRISIS_PATTERNS = [
  /\bkill myself\b/i,
  /\bend my life\b/i,
  /\bsuicid(e|al)\b/i,
  /\bwant to die\b/i,
  /\bself[\s-]?harm\b/i,
  /\bhurting myself\b/i,
];

export function containsCrisisLanguage(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

export const CRISIS_RESOURCES = [
  { region: "India", name: "iCall (TISS)", contact: "tel:+919152987821", note: "Mon–Sat, 8am–10pm" },
  { region: "India", name: "AASRA", contact: "tel:+919820466726", note: "24×7" },
  { region: "International", name: "Find A Helpline", contact: "https://findahelpline.com", note: "Directory by country" },
];
