"use client";

import type { AvatarConfig } from "@/types/database";
import {
  SKIN_TONES,
  HAIR_COLORS,
  CLOTHING_COLORS,
  BACKGROUNDS,
  FACE_SHAPES,
  HAIRSTYLES,
  EYE_STYLES,
  EYEBROW_STYLES,
  CLOTHING_STYLES,
  ACCESSORIES,
  DETAILS,
  EXPRESSIONS,
  randomAvatarConfig,
  type Expression,
} from "@/lib/avatar";
import { AvatarRenderer } from "./AvatarRenderer";
import { playSound } from "@/lib/sound";
import { cx } from "@/lib/utils";

function Swatches({
  value,
  options,
  onChange,
}: {
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Choose color ${c}`}
          onClick={() => {
            onChange(c);
            playSound("click");
          }}
          className={cx("w-7 h-7 border-2", value === c ? "border-ink scale-110" : "border-ink/20")}
          style={{ background: c, transition: "transform 0.1s ease" }}
        />
      ))}
    </div>
  );
}

function Chips<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o}
          type="button"
          onClick={() => {
            onChange(o);
            playSound("click");
          }}
          className={cx("tag-chip capitalize", value === o && "bg-ink text-paper")}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export function AvatarBuilder({
  config,
  expression,
  onChange,
  onExpressionChange,
}: {
  config: AvatarConfig;
  expression: Expression;
  onChange: (config: AvatarConfig) => void;
  onExpressionChange: (expression: Expression) => void;
}) {
  function set<K extends keyof AvatarConfig>(key: K, value: AvatarConfig[K]) {
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="grid md:grid-cols-[280px_1fr] gap-10">
      <div className="flex flex-col items-center gap-4">
        <div className="border-2 border-ink p-4 bg-paper">
          <AvatarRenderer config={config} expression={expression} size={220} />
        </div>
        <button
          type="button"
          className="btn btn-outline w-full justify-center"
          onClick={() => {
            onChange(randomAvatarConfig());
            playSound("reaction");
          }}
        >
          SURPRISE ME
        </button>
      </div>

      <div className="flex flex-col gap-7">
        <section>
          <p className="field-label">Skin tone</p>
          <Swatches value={config.skinTone} options={SKIN_TONES} onChange={(v) => set("skinTone", v)} />
        </section>

        <section>
          <p className="field-label">Face shape</p>
          <Chips value={config.faceShape} options={FACE_SHAPES} onChange={(v) => set("faceShape", v)} />
        </section>

        <div className="grid sm:grid-cols-2 gap-7">
          <section>
            <p className="field-label">Hairstyle</p>
            <Chips value={config.hair} options={HAIRSTYLES} onChange={(v) => set("hair", v)} />
          </section>
          <section>
            <p className="field-label">Hair / brow color</p>
            <Swatches value={config.hairColor} options={HAIR_COLORS} onChange={(v) => set("hairColor", v)} />
          </section>
        </div>

        <div className="grid sm:grid-cols-2 gap-7">
          <section>
            <p className="field-label">Eyes</p>
            <Chips value={config.eyes} options={EYE_STYLES} onChange={(v) => set("eyes", v)} />
          </section>
          <section>
            <p className="field-label">Eyebrows</p>
            <Chips value={config.eyebrows} options={EYEBROW_STYLES} onChange={(v) => set("eyebrows", v)} />
          </section>
        </div>

        <div className="grid sm:grid-cols-2 gap-7">
          <section>
            <p className="field-label">Clothing</p>
            <Chips value={config.clothing} options={CLOTHING_STYLES} onChange={(v) => set("clothing", v)} />
          </section>
          <section>
            <p className="field-label">Clothing color</p>
            <Swatches value={config.clothingColor} options={CLOTHING_COLORS} onChange={(v) => set("clothingColor", v)} />
          </section>
        </div>

        <div className="grid sm:grid-cols-2 gap-7">
          <section>
            <p className="field-label">Accessory</p>
            <Chips value={config.accessory} options={ACCESSORIES} onChange={(v) => set("accessory", v)} />
          </section>
          <section>
            <p className="field-label">Weird little detail</p>
            <Chips value={config.detail} options={DETAILS} onChange={(v) => set("detail", v)} />
          </section>
        </div>

        <section>
          <p className="field-label">Background</p>
          <Swatches value={config.background} options={BACKGROUNDS} onChange={(v) => set("background", v)} />
        </section>

        <section className="border-t border-ink/15 pt-6">
          <p className="field-label">How are you actually feeling right now?</p>
          <div className="flex flex-wrap gap-2">
            {EXPRESSIONS.map((e) => (
              <button
                key={e.key}
                type="button"
                onClick={() => {
                  onExpressionChange(e.key);
                  playSound("click");
                }}
                className={cx("tag-chip", expression === e.key && "bg-ink text-paper")}
              >
                {e.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] opacity-50 mt-2">You can change this anytime — it&apos;s not permanent, you&apos;re not either.</p>
        </section>
      </div>
    </div>
  );
}
