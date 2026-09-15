"use client";

import { PixelHuman, useHeroScrollProgress } from "./PixelHuman";
import { DoodleArrow } from "./Doodles";

export function Hero() {
  const { ref, progress } = useHeroScrollProgress();
  const crack = Math.min(1, progress / 0.5);

  return (
    <section ref={ref} className="relative min-h-[100svh] flex flex-col justify-between overflow-hidden">
      <div className="flex-1 flex flex-col justify-center px-5 md:px-10 pt-10">
        <div className="mx-auto max-w-[1600px] w-full">
          <p className="sys text-xs md:text-sm mb-5 opacity-60">FAULT LINE — AN ANONYMOUS SOCIAL SPACE</p>

          <h1 className="relative font-grotesk font-black uppercase text-mega leading-[0.92]">
            <span
              className="block relative"
              style={{
                textShadow: crack > 0.05 ? `${crack * 3}px 0 0 #FF3B30, ${-crack * 3}px 0 0 #245CFF` : "none",
                transform: `translateX(${crack * -1.5}px)`,
              }}
            >
              YOU DON&apos;T HAVE TO
            </span>
            <span className="block">LOOK PERFECT HERE.</span>
          </h1>

          <div className="mt-8 md:mt-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <p className="max-w-[38ch] text-base md:text-lg">
              Everyone has something they hide.
              <br />
              Welcome to the place where you don&apos;t have to.
            </p>

            <div className="flex items-center gap-3 shrink-0">
              <DoodleArrow className="w-16 h-8 text-ink rotate-[8deg]" />
              <span className="px-font text-[10px] leading-relaxed max-w-[14ch]">SCROLL TO CRACK OPEN</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex justify-center pb-6 md:pb-10">
        <PixelHuman progress={progress} />
      </div>

      <div className="rule-strong" />
    </section>
  );
}
