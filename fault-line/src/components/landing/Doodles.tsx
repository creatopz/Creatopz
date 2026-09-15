"use client";

import { cx } from "@/lib/utils";

/**
 * Hand-drawn doodle SVGs. Deliberately imperfect paths — slightly uneven
 * strokes, not a polished icon set. Used sparingly throughout the site.
 */

type DoodleProps = { className?: string; wiggle?: boolean };

function wrap(className: string | undefined, wiggle: boolean | undefined) {
  return cx("inline-block", wiggle && "animate-wiggle", className);
}

export function DoodleArrow({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 80 40" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path d="M2 22c14-9 33-13 58-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M48 6c4 3 9 5 12 7-2 4-4 9-5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DoodleCircle({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path
        d="M31 4C15 3 4 15 5 30c1 16 14 27 29 25 14-2 23-15 22-28C55 14 44 5 31 4Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function DoodleCrossOut({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 100 20" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path d="M2 9c20-6 60-8 96 2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M3 14c24-9 58-12 95 -3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function DoodleBrokenHeart({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 48 44" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path
        d="M24 39C10 30 2 22 2 13 2 6 8 2 14 3c4 .6 8 3 10 8 2-5 6-7.4 10-8 6-1 12 3 12 10 0 9-8 17-22 26Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M22 8l-4 9 6 3-5 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DoodleEyes({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 90 30" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <ellipse cx="20" cy="15" rx="15" ry="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="22" cy="16" r="4" fill="currentColor" />
      <ellipse cx="68" cy="14" rx="15" ry="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="65" cy="15" r="4" fill="currentColor" />
    </svg>
  );
}

export function DoodleTear({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 20 30" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path d="M10 2C4 12 2 17 2 21a8 8 0 0016 0c0-4-2-9-8-19Z" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}

export function DoodleMonster({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 56" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path
        d="M8 30c-2-14 6-24 22-24s24 10 22 24c1 6-2 10-2 10l-4-6-4 8-4-7-4 8-4-7-4 7-4-8-4 6s-3-4-2-10Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="21" cy="24" r="2.4" fill="currentColor" />
      <circle cx="39" cy="24" r="2.4" fill="currentColor" />
      <path d="M22 33c3 3 13 3 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function DoodleSpeechBubble({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 70 50" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <path
        d="M4 8c0-3 3-5 6-5h50c3 0 6 2 6 5v22c0 3-3 5-6 5H30l-11 10 1-10H10c-3 0-6-2-6-5Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleCrack({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 12 200" className={wrap(className, wiggle)} preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path
        d="M6 0 L4 20 L8 38 L2 55 L7 74 L3 92 L9 112 L4 132 L8 150 L3 170 L6 200"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function DoodleAwkwardFace({ className, wiggle }: DoodleProps) {
  return (
    <svg viewBox="0 0 60 60" className={wrap(className, wiggle)} fill="none" aria-hidden="true">
      <circle cx="30" cy="30" r="26" stroke="currentColor" strokeWidth="2" />
      <path d="M18 24c2-2 6-2 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="38" cy="23" r="1.6" fill="currentColor" />
      <path d="M18 40c6 4 16 4 22-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
