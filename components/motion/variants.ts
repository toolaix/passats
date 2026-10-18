import type { Transition, Variants } from "motion/react";

export const easeOut: Transition["ease"] = [0.22, 1, 0.36, 1];

/**
 * Hero timeline (once, ≤~1.6s):
 * copy stagger → card land (shadow) → ring∥CountUp climax → row labels + micro-bars.
 */
export const heroTiming = {
  ease: easeOut,
  copyDelay: 0.04,
  copyStagger: 0.07,
  cardDelay: 0.26,
  labelDelay: 0.34,
  scoreDelay: 0.42,
  scoreDuration: 0.85,
  rowsDelay: 0.5,
  rowStagger: 0.05,
  /** Micro-bars share ring phase (ring primary, bars secondary) */
  barDelay: 0.42,
  barDuration: 0.85,
} as const;

/** Real scan result: ring ∥ CountUp ∥ bars same phase, then issues */
export const scanResultTiming = {
  ease: easeOut,
  shellDuration: 0.4,
  scoreDuration: 0.9,
  scoreDelay: 0,
  barDuration: 0.9,
  barDelay: 0,
  issuesDelay: 0.95,
  issueStagger: 0.05,
} as const;

/* --- Shared --- */

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

export const scanIssuesContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: scanResultTiming.issuesDelay,
      staggerChildren: scanResultTiming.issueStagger,
    },
  },
};

/* --- Hero choreography --- */

export const heroCopyContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      delayChildren: heroTiming.copyDelay,
      staggerChildren: heroTiming.copyStagger,
    },
  },
};

export const heroEyebrow: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: easeOut },
  },
};

export const heroLead: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export const heroActions: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export const heroPills: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOut },
  },
};

/** Card lands with shadow settle — no scale bounce */
export const heroCard: Variants = {
  hidden: {
    opacity: 0,
    y: 16,
    boxShadow:
      "0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 4px 16px rgba(0, 0, 0, 0.12)",
  },
  show: {
    opacity: 1,
    y: 0,
    boxShadow:
      "0 1px 0 rgba(255, 255, 255, 0.07) inset, 0 14px 44px rgba(0, 0, 0, 0.28), 0 0 0 1px rgba(45, 212, 191, 0.05)",
    transition: {
      duration: 0.55,
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
      duration: 0.3,
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
      duration: 0.35,
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
    transition: { duration: 0.35, ease: easeOut },
  },
};

/** Clean-row status dot: opacity fade, not width */
export const heroCleanDot: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.45, ease: easeOut },
  },
};

export function reducedVariants(reduced: boolean | null): Variants {
  if (reduced) {
    return {
      hidden: { opacity: 1 },
      show: { opacity: 1 },
    };
  }
  return fadeUp;
}
