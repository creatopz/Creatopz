"use client";

import { useEffect, useRef } from "react";

/**
 * Adds `.is-visible` to any [data-reveal] descendant of the returned ref
 * once it crosses into the viewport. Pairs with the `.reveal` CSS class.
 * One IntersectionObserver per section, not per element — cheap.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const targets = root.matches("[data-reveal]") ? [root] : Array.from(root.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );

    targets.forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, []);

  return ref;
}
