"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import PixelPerson from "@/components/landing/PixelPerson";

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const crackHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const wobble = useTransform(scrollYProgress, [0, 1], [0, 14]);
  const fineDrop = useTransform(scrollYProgress, [0.15, 0.55], [0, 1]);

  const [shift, setShift] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = (e.clientX - rect.left) / rect.width - 0.5;
    const relY = (e.clientY - rect.top) / rect.height - 0.5;
    setShift({ x: relX * 6, y: relY * 4 });
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMouseMove}
      className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-grey">
        STATUS: HUMAN &nbsp;·&nbsp; EGO SHIELD: OFF &nbsp;·&nbsp; TRUTH LEVEL: 87%
      </p>

      <motion.h1
        style={{ transform: `translate(${shift.x}px, ${shift.y}px)` }}
        className="mt-6 select-none font-grotesk text-mega font-black uppercase leading-[0.85] text-ink"
      >
        <span className="block">FAULT</span>
        <span
          className="block"
          style={{ transform: `translate(${-shift.x * 1.6}px, ${-shift.y}px) translateX(0.06em)` }}
        >
          LINE
        </span>
      </motion.h1>

      <div className="relative mt-10 h-16 w-64 max-w-full">
        <svg viewBox="0 0 256 20" className="absolute inset-0 h-full w-full overflow-visible">
          <line x1="0" y1="10" x2="256" y2="10" stroke="#111" strokeWidth="2" />
          <motion.line
            x1="118"
            y1="10"
            x2="138"
            y2="10"
            stroke="#FF3B30"
            strokeWidth="2"
            style={{ scaleY: crackHeight, transformOrigin: "center" }}
          />
        </svg>
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full"
          style={{ rotate: wobble }}
        >
          <PixelPerson />
        </motion.div>
      </div>

      <div className="relative mt-10 h-16">
        <motion.p
          style={{ opacity: useTransform(fineDrop, [0, 1], [1, 0]) }}
          className="absolute inset-x-0 font-grotesk text-2xl font-bold uppercase tracking-tight md:text-3xl"
        >
          YOU LOOK <span className="line-through decoration-crack decoration-4">FINE</span> ONLINE.
        </motion.p>
        <motion.p
          style={{ opacity: fineDrop }}
          className="absolute inset-x-0 font-grotesk text-2xl font-black uppercase tracking-tight text-crack md:text-3xl"
        >
          BUT ARE YOU?
        </motion.p>
      </div>

      <p className="mt-6 max-w-sm font-mono text-sm text-ink/70">
        A place for the things you don&rsquo;t post.
      </p>

      <Link
        href="/auth/signup"
        data-cursor="CLICK"
        className="mt-8 border-2 border-ink bg-ink px-8 py-4 font-mono text-sm uppercase tracking-widest text-paper transition-transform hover:-translate-y-1 hover:bg-crack hover:border-crack"
      >
        ENTER THE FAULT →
      </Link>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-widest text-grey">
        ₹1 / MONTH &nbsp;·&nbsp; NO PERFECT PHOTOS REQUIRED
      </p>

      <motion.div
        aria-hidden
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.6 }}
        className="absolute bottom-6 font-mono text-[10px] uppercase tracking-widest text-grey"
      >
        ↓ scroll
      </motion.div>
    </section>
  );
}
