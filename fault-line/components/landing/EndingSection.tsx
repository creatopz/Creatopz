"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import PixelPerson from "@/components/landing/PixelPerson";

export default function EndingSection() {
  return (
    <section className="flex min-h-[90svh] flex-col items-center justify-center gap-10 bg-paper px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.8 }}
      >
        <PixelPerson />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6 }}
        className="font-grotesk text-huge font-black uppercase leading-[0.9]"
      >
        Maybe you don&rsquo;t need
        <br />
        to fix everything.
      </motion.h2>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="font-grotesk text-huge font-black uppercase leading-[0.9] text-crack"
      >
        Maybe you just need
        <br />
        somewhere to say it.
      </motion.h2>

      <Link
        href="/auth/signup"
        data-cursor="CLICK"
        className="mt-4 border-2 border-ink bg-ink px-10 py-5 font-mono text-sm uppercase tracking-widest text-paper hover:-translate-y-1 hover:bg-crack hover:border-crack"
      >
        [ ENTER FAULT LINE ]
      </Link>
      <p className="font-mono text-[10px] uppercase tracking-widest text-grey">₹1. That&rsquo;s all.</p>
    </section>
  );
}
