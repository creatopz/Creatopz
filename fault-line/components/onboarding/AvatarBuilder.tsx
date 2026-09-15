"use client";

import PixelAvatar from "@/components/PixelAvatar";
import { AvatarConfig } from "@/lib/types";

const SKIN_TONES = ["#F6D5B8", "#E8B48A", "#C68955", "#8D5A34", "#5C3A21"];
const HAIR_COLORS = ["#111111", "#5C3A21", "#B8860B", "#8B0000", "#F1EFE8"];
const HAIR_STYLES: AvatarConfig["hairStyle"][] = ["none", "short", "long", "spiky", "buzz"];
const EYES: AvatarConfig["eyes"][] = ["dot", "wide", "sleepy", "wink", "closed"];
const EYEBROWS: AvatarConfig["eyebrows"][] = ["flat", "raised", "worried", "none"];
const MOUTHS: AvatarConfig["mouth"][] = ["line", "smile", "frown", "open", "wobble"];
const FACE_SHAPES: AvatarConfig["faceShape"][] = ["round", "square", "long"];
const ACCESSORIES: AvatarConfig["accessory"][] = ["none", "glasses", "blush", "freckles"];
const MOODS = [":|", ":D", ":/", "T_T", "¬_¬", "¯\\_(ツ)_/¯"];

export default function AvatarBuilder({
  config,
  mood,
  onChange,
  onMoodChange,
}: {
  config: AvatarConfig;
  mood: string;
  onChange: (next: AvatarConfig) => void;
  onMoodChange: (next: string) => void;
}) {
  const set = <K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) =>
    onChange({ ...config, [key]: value });

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <div className="flex flex-col items-center gap-3">
        <div className="border-2 border-ink bg-white p-4 shadow-[4px_4px_0_#111]">
          <PixelAvatar config={config} size={140} />
        </div>
        <p className="font-mono text-2xl">{mood}</p>
      </div>

      <div className="space-y-5">
        <Swatches label="SKIN" values={SKIN_TONES} current={config.skin} onPick={(v) => set("skin", v)} />
        <Swatches label="HAIR COLOR" values={HAIR_COLORS} current={config.hair} onPick={(v) => set("hair", v)} />
        <Options label="HAIR STYLE" values={HAIR_STYLES} current={config.hairStyle} onPick={(v) => set("hairStyle", v)} />
        <Options label="FACE SHAPE" values={FACE_SHAPES} current={config.faceShape} onPick={(v) => set("faceShape", v)} />
        <Options label="EYES" values={EYES} current={config.eyes} onPick={(v) => set("eyes", v)} />
        <Options label="EYEBROWS" values={EYEBROWS} current={config.eyebrows} onPick={(v) => set("eyebrows", v)} />
        <Options label="MOUTH" values={MOUTHS} current={config.mouth} onPick={(v) => set("mouth", v)} />
        <Options label="EXTRA" values={ACCESSORIES} current={config.accessory} onPick={(v) => set("accessory", v)} />
        <Options label="CURRENT MOOD" values={MOODS} current={mood} onPick={onMoodChange} />
      </div>
    </div>
  );
}

function Swatches({
  label,
  values,
  current,
  onPick,
}: {
  label: string;
  values: string[];
  current: string;
  onPick: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-grey">{label}</p>
      <div className="flex gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            aria-label={v}
            className={`h-7 w-7 border-2 ${current === v ? "border-crack" : "border-ink/30"}`}
            style={{ background: v }}
          />
        ))}
      </div>
    </div>
  );
}

function Options<T extends string>({
  label,
  values,
  current,
  onPick,
}: {
  label: string;
  values: T[];
  current: T;
  onPick: (v: T) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-widest text-grey">{label}</p>
      <div className="flex flex-wrap gap-2">
        {values.map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className={`border-2 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide ${
              current === v ? "border-ink bg-ink text-paper" : "border-ink/30 text-ink hover:border-ink"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}
