"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

/**
 * Gate Framer/Motion `initial="hidden"` until after client mount.
 * SSR and first paint stay visible (no opacity:0 inline styles);
 * after mount, animations run from hidden → show as usual.
 */
export function useMotionReady() {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);
  const run = Boolean(ready && !reduced);
  return {
    reduced,
    ready,
    run,
    /** Pass to motion `initial` — false until ready so SSR stays visible */
    initial: (run ? "hidden" : false) as "hidden" | false,
  };
}
