"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { site } from "@/site.config";
import styles from "./SiteNav.module.css";

export function SiteNav() {
  const reduced = useReducedMotion();
  const { scrollY } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 12);
  });

  return (
    <motion.header
      className={`${styles.nav} ${scrolled ? styles.navScrolled : ""}`}
      initial={false}
      animate={
        reduced
          ? undefined
          : {
              boxShadow: scrolled
                ? "0 8px 28px rgba(0, 0, 0, 0.35)"
                : "0 0 0 rgba(0, 0, 0, 0)",
              backgroundColor: scrolled
                ? "rgba(7, 11, 20, 0.88)"
                : "rgba(7, 11, 20, 0.72)",
            }
      }
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <span className={styles.mark}>P</span>
          {site.name}
        </Link>
        <nav className={styles.links} aria-label="Primary">
          <Link href="/#scan">Free scan</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#faq">FAQ</Link>
          <Link href="/#pricing">Pricing</Link>
          <motion.div
            whileHover={reduced ? undefined : { scale: 1.04 }}
            whileTap={reduced ? undefined : { scale: 0.96 }}
          >
            <Link href="/#scan" className={styles.cta}>
              Check resume
            </Link>
          </motion.div>
        </nav>
      </div>
    </motion.header>
  );
}
