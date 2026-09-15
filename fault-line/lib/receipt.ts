// Deterministic pseudo-randomness seeded by the user's id, so a receipt
// looks the same every time you view it but differs person to person.
function seededRandom(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) || 0;
  }
  return () => {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

const OVERTHINKING = ["MILD", "MODERATE", "SIGNIFICANT", "EXTREME", "UNMEASURABLE"];
const ACT_NORMAL = ["STABLE", "FLICKERING", "UNSTABLE", "RUNNING ON FUMES"];
const FAULTS = [
  "CARING TOO MUCH",
  "SAYING YES WHEN YOU MEANT NO",
  "OVERANALYZING SILENCE",
  "APOLOGIZING FOR EXISTING",
  "COMPARING YOURSELF TO STRANGERS",
  "REMEMBERING EMBARRASSING THINGS FOREVER",
];

export function generateReceipt(seed: string, username: string) {
  const rand = seededRandom(seed);
  const publicConfidence = 55 + Math.floor(rand() * 40);
  const actualConfidence = Math.max(10, publicConfidence - 15 - Math.floor(rand() * 30));
  return {
    username,
    publicConfidence,
    actualConfidence,
    overthinkingCapacity: OVERTHINKING[Math.floor(rand() * OVERTHINKING.length)],
    actNormal: ACT_NORMAL[Math.floor(rand() * ACT_NORMAL.length)],
    primaryFault: FAULTS[Math.floor(rand() * FAULTS.length)],
  };
}
