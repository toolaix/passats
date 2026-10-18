"use client";

import { animate, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

type CountUpProps = {
  to: number;
  from?: number;
  duration?: number;
  className?: string;
  /** Re-run when this key changes (e.g. scan result id) */
  replayKey?: string | number;
};

export function CountUp({
  to,
  from = 0,
  duration = 0.9,
  className,
  replayKey,
}: CountUpProps) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(reduced ? to : from);

  useEffect(() => {
    if (reduced) {
      setValue(to);
      return;
    }
    setValue(from);
    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [to, from, duration, reduced, replayKey]);

  return <span className={className}>{value}</span>;
}
