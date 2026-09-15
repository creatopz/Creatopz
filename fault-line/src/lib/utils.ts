export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const ADJECTIVES = [
  "quiet", "cracked", "hollow", "tangled", "faded", "restless", "unseen",
  "crooked", "static", "flickering", "distant", "unfinished", "muted",
  "drifting", "worn", "stray", "blank", "uneven",
];
const NOUNS = [
  "signal", "mirror", "hallway", "static", "shoreline", "echo", "circuit",
  "window", "orbit", "compass", "lantern", "current", "corridor", "wire",
  "harbor", "fracture", "paper", "ember",
];

export function generateAnonymousUsername() {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 900) + 100;
  return `${a}_${n}_${num}`;
}

export function formatRelativeTime(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}
