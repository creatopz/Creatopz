export const EMOTIONAL_TAGS = [
  "INSECURITY",
  "FEAR",
  "FAILURE",
  "AWKWARD",
  "ANGER",
  "LONELY",
  "JEALOUS",
  "CONFUSED",
  "CLUMSY",
  "OTHER",
] as const;

export type EmotionalTag = (typeof EMOTIONAL_TAGS)[number];

export const REACTION_KINDS = [
  { key: "me_too", label: "ME TOO" },
  { key: "felt_that", label: "FELT THAT" },
  { key: "ouch", label: "OUCH" },
  { key: "hug", label: "🫂 HUG" },
] as const;

export const MAX_POST_LENGTH = 2000;
export const DAILY_POST_LIMIT = 20;
