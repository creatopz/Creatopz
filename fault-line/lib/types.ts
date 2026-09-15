export type AvatarConfig = {
  skin: string; // hex
  hair: string; // hex, "" = none
  hairStyle: "none" | "short" | "long" | "spiky" | "buzz";
  eyes: "dot" | "wide" | "sleepy" | "wink" | "closed";
  eyebrows: "flat" | "raised" | "worried" | "none";
  mouth: "line" | "smile" | "frown" | "open" | "wobble";
  faceShape: "round" | "square" | "long";
  accessory: "none" | "glasses" | "blush" | "freckles";
};

export const DEFAULT_AVATAR: AvatarConfig = {
  skin: "#E8B48A",
  hair: "#111111",
  hairStyle: "short",
  eyes: "dot",
  eyebrows: "flat",
  mouth: "line",
  faceShape: "round",
  accessory: "none",
};

export type MoodExpression = ":|" | ":D" | ":/" | "T_T" | "¬_¬" | "¯\\_(ツ)_/¯";

export const VIBE_TAGS = [
  "OVERTHINKER",
  "SOCIAL BUT TIRED",
  "CHRONICALLY AWKWARD",
  "PRETENDING TO KNOW THINGS",
  "QUIET CHAOS",
  "TOO SELF AWARE",
  "MAIN CHARACTER IN PRIVATE",
  "EMOTIONALLY BUFFERING...",
] as const;

export type VibeTag = (typeof VIBE_TAGS)[number];

export const REACTION_TYPES = [
  { key: "same_here", label: "SAME HERE" },
  { key: "feel_this", label: "I FEEL THIS" },
  { key: "not_alone", label: "YOU'RE NOT ALONE" },
  { key: "ouch", label: "OUCH" },
  { key: "too_real", label: "THAT'S TOO REAL" },
] as const;

export type ReactionType = (typeof REACTION_TYPES)[number]["key"];

export const PRIVACY_LEVELS = [
  { key: "anonymous", label: "FULLY ANONYMOUS", desc: "No username shown, ever." },
  { key: "pseudonymous", label: "PSEUDONYMOUS", desc: "Your pixel handle only. No real identity." },
  { key: "open", label: "SEMI-OPEN", desc: "Handle + bio visible to the community." },
] as const;

export type Profile = {
  id: string;
  username: string;
  avatar_config: AvatarConfig;
  mood: MoodExpression;
  bio: string | null;
  vibe_tags: string[];
  privacy_level: (typeof PRIVACY_LEVELS)[number]["key"];
  fault_frequency: Record<string, string> | null;
  role: "user" | "moderator" | "admin";
  onboarded: boolean;
  created_at: string;
};

export type Post = {
  id: string;
  user_id: string;
  content: string;
  visibility: "public" | "community" | "anonymous";
  community_id: string | null;
  created_at: string;
  profile?: Pick<Profile, "id" | "username" | "avatar_config" | "mood" | "privacy_level">;
  reaction_counts?: Record<ReactionType, number>;
  my_reaction?: ReactionType | null;
  comment_count?: number;
};

export type Community = {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  member_count?: number;
  is_member?: boolean;
};
