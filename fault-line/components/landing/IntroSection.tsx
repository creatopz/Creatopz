"use client";

import { motion } from "framer-motion";
import PixelAvatar from "@/components/PixelAvatar";
import { DEFAULT_AVATAR } from "@/lib/types";

const PERFECT_AVATAR = {
  ...DEFAULT_AVATAR,
  eyes: "wide" as const,
  mouth: "smile" as const,
  eyebrows: "raised" as const,
};

const REAL_AVATAR = {
  ...DEFAULT_AVATAR,
  eyes: "sleepy" as const,
  mouth: "wobble" as const,
  eyebrows: "worried" as const,
  accessory: "blush" as const,
};

export default function IntroSection() {
  return (
    <section className="bg-ink px-6 py-28 text-paper">
      <div className="mx-auto max-w-3xl text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-acid">[ THE ANSWER ]</p>
        <h2 className="mt-3 font-grotesk text-huge font-black uppercase leading-[0.9]">
          So we made a place
          <br />
          for the other version
          <br />
          of you.
        </h2>

        <div className="mx-auto mt-16 flex max-w-sm items-center justify-center gap-8">
          <motion.div
            initial={{ opacity: 1, scale: 1 }}
            whileInView={{ opacity: [1, 1, 0], scale: [1, 1.05, 0.8] }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 1.4, times: [0, 0.5, 1] }}
            className="flex flex-col items-center gap-3"
          >
            <div className="border-2 border-paper/20 bg-paper p-3">
              <PixelAvatar config={PERFECT_AVATAR} size={72} />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-paper/50">PERFECT PROFILE</p>
          </motion.div>

          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-mono text-2xl text-acid"
          >
            →
          </motion.span>

          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="border-2 border-acid bg-paper p-3">
              <PixelAvatar config={REAL_AVATAR} size={72} />
            </div>
            <p className="font-mono text-[9px] uppercase tracking-widest text-acid">REAL HUMAN</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
