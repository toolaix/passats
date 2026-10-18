import type { Transition, Variants } from "motion/react";

export const easeOut: Transition["ease"] = [0.22, 1, 0.36, 1];

/** Hero timeline: copy → card (~0.3s) → score ring+count → rows. Shared easeOut. Entrance only. */
export const heroTiming = {
  ease: easeOut,
  copyDelay: 0.04,
  copyStagger: 0.085,
  cardDelay: 0.3,
  labelDelay: 0.38,
  scoreDelay: 0.5,
  scoreDuration: 0.95,
  rowsDelay: 0.95,
  rowStagger: 0.06,
} as const;

/* --- Shared (Reveal, ScanTool) — keep calm defaults --- */

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 10 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05,
    },
  },
};

export const staggerFast: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.12,
    },
  },
};

export const rowIn: Variants = {
  hidden: { opacity: 0, x: 8 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/* --- Hero choreography (narrative, no loops) --- */

export const heroCopyContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: heroTiming.copyDelay,
      staggerChildren: heroTiming.copyStagger,
    },
  },
};

/** Soft / short — eyebrow */
export const heroEyebrow: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/** Slightly longer — headline carries weight */
export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: easeOut },
  },
};

export const heroLead: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeOut },
  },
};

export const heroActions: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const heroPills: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/** Card is the climax — delayed after copy starts */
export const heroCard: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: easeOut,
      delay: heroTiming.cardDelay,
    },
  },
};

export const heroCardLabel: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: easeOut,
      delay: heroTiming.labelDelay,
    },
  },
};

export const heroScoreBlock: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
      delay: heroTiming.scoreDelay - 0.06,
    },
  },
};

export const heroRowsContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: heroTiming.rowsDelay,
      staggerChildren: heroTiming.rowStagger,
    },
  },
};

export const heroRow: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

/** Instant / no-op when reduced motion is preferred */
export function reducedVariants(reduced: boolean | null): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1 },
      show: { opacity: 1 },
    };
  }
  return fadeUp;
}
