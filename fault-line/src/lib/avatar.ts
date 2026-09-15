import type { AvatarConfig } from "@/types/database";

export const SKIN_TONES = ["#3E2723", "#5D4037", "#8D5524", "#C68642", "#E0AC69", "#F1C27D", "#FFDBAC", "#F4E4D4"];
export const HAIR_COLORS = ["#111111", "#3B2415", "#6B4226", "#A9642A", "#D4A24C", "#E8E3D3", "#C7FF00", "#245CFF"];
export const CLOTHING_COLORS = ["#111111", "#245CFF", "#FF3B30", "#C7FF00", "#F4F1EA", "#6B4226"];
export const BACKGROUNDS = ["#F4F1EA", "#EAE6DC", "#111111", "#245CFF", "#FF3B30", "#C7FF00"];

export const FACE_SHAPES = ["round", "square", "long"] as const;
export const HAIRSTYLES = ["none", "buzz", "short", "long", "curly", "mohawk"] as const;
export const EYE_STYLES = ["dot", "wide", "sleepy", "sharp"] as const;
export const EYEBROW_STYLES = ["flat", "angled", "raised", "none"] as const;
export const CLOTHING_STYLES = ["crew", "hoodie", "collar", "stripes"] as const;
export const ACCESSORIES = ["none", "glasses", "headphones", "cap", "earring"] as const;
export const DETAILS = ["none", "freckles", "scar", "blush"] as const;

export type Expression =
  | "neutral"
  | "awkward_smile"
  | "nervous"
  | "crying_ok"
  | "dead_inside"
  | "angry"
  | "confused"
  | "embarrassed"
  | "pretending_fine";

export const EXPRESSIONS: { key: Expression; label: string }[] = [
  { key: "neutral", label: "Neutral" },
  { key: "awkward_smile", label: "Awkward smile" },
  { key: "nervous", label: "Nervous" },
  { key: "crying_ok", label: "Crying, but okay" },
  { key: "dead_inside", label: "Dead inside" },
  { key: "angry", label: "Angry" },
  { key: "confused", label: "Confused" },
  { key: "embarrassed", label: "Embarrassed" },
  { key: "pretending_fine", label: "Pretending to be fine" },
];

export const DEFAULT_AVATAR_CONFIG: AvatarConfig = {
  skinTone: SKIN_TONES[4],
  faceShape: "round",
  hair: "short",
  hairColor: HAIR_COLORS[0],
  eyes: "dot",
  eyebrows: "flat",
  clothing: "crew",
  clothingColor: CLOTHING_COLORS[1],
  accessory: "none",
  detail: "none",
  background: BACKGROUNDS[0],
};

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomAvatarConfig(): AvatarConfig {
  return {
    skinTone: pick(SKIN_TONES),
    faceShape: pick(FACE_SHAPES),
    hair: pick(HAIRSTYLES),
    hairColor: pick(HAIR_COLORS),
    eyes: pick(EYE_STYLES),
    eyebrows: pick(EYEBROW_STYLES),
    clothing: pick(CLOTHING_STYLES),
    clothingColor: pick(CLOTHING_COLORS),
    accessory: pick(ACCESSORIES),
    detail: pick(DETAILS),
    background: pick(BACKGROUNDS),
  };
}
