"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";
import { fadeUp, staggerContainer } from "./variants";
import { useMotionReady } from "./useMotionReady";

type RevealProps = {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "ul" | "li";
  delay?: number;
  /** Stagger children that also use RevealItem / fadeUp */
  stagger?: boolean;
};

export function Reveal({
  children,
  className,
  as = "div",
  delay = 0,
  stagger = false,
}: RevealProps) {
  const { reduced, run, initial } = useMotionReady();
  const Comp = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Comp
      className={className}
      variants={run ? (stagger ? staggerContainer : fadeUp) : undefined}
      initial={initial}
      whileInView={run ? "show" : undefined}
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -40px 0px" }}
      transition={
        run && !stagger
          ? { delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
          : undefined
      }
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  const { reduced, run } = useMotionReady();
  const Comp = motion[as];

  if (reduced) {
    const Tag = as;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Comp className={className} variants={run ? fadeUp : undefined}>
      {children}
    </Comp>
  );
}
