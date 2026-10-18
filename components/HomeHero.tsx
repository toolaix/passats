"use client";

import { motion, useReducedMotion } from "motion/react";
import { site } from "@/site.config";
import { CountUp } from "./motion/CountUp";
import {
  fadeUp,
  rowIn,
  scaleIn,
  staggerContainer,
  staggerFast,
} from "./motion/variants";
import styles from "@/app/home.module.css";

const SAMPLE_ROWS = [
  { label: "Sections & contact", value: "38/40" },
  { label: "Impact language", value: "22/30" },
  { label: "JD keywords", value: "18/25" },
  { label: "Layout risk", value: "Clean" },
] as const;

const SAMPLE_SCORE = 84;

export function HomeHero() {
  const reduced = useReducedMotion();

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <motion.div
          variants={reduced ? undefined : staggerContainer}
          initial={reduced ? false : "hidden"}
          animate="show"
        >
          <motion.p
            className={styles.eyebrow}
            variants={reduced ? undefined : fadeUp}
          >
            Free ATS resume scan · no signup
          </motion.p>
          <motion.h1 variants={reduced ? undefined : fadeUp}>
            ATS resume checker that shows what to fix
          </motion.h1>
          <motion.p
            className={styles.lead}
            variants={reduced ? undefined : fadeUp}
          >
            {site.tagline}
          </motion.p>
          <motion.div
            className={styles.actions}
            variants={reduced ? undefined : fadeUp}
          >
            <motion.a
              className={styles.primaryBtn}
              href="#scan"
              whileHover={reduced ? undefined : { scale: 1.03, y: -1 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
              transition={{ type: "spring", stiffness: 420, damping: 24 }}
            >
              Start free scan
            </motion.a>
            <motion.a
              className={styles.ghostBtn}
              href="#how"
              whileHover={reduced ? undefined : { scale: 1.02 }}
              whileTap={reduced ? undefined : { scale: 0.97 }}
            >
              How scoring works
            </motion.a>
          </motion.div>
          <motion.div
            className={styles.pills}
            variants={reduced ? undefined : fadeUp}
          >
            <span className={styles.pill}>PDF & DOCX</span>
            <span className={styles.pill}>ATS resume score</span>
            <span className={styles.pill}>Missing keywords</span>
            <span className={styles.pill}>{site.monetization.freeQuotaLabel}</span>
          </motion.div>
        </motion.div>

        <motion.aside
          className={styles.heroCard}
          aria-label="Sample score preview"
          variants={reduced ? undefined : scaleIn}
          initial={reduced ? false : "hidden"}
          animate="show"
          whileHover={
            reduced
              ? undefined
              : {
                  y: -3,
                  transition: { type: "spring", stiffness: 380, damping: 28 },
                }
          }
          style={{ originY: 0.5 }}
        >
          <div className={styles.heroCardTop}>
            <p className={styles.heroCardLabel}>Example result</p>
            <p className={styles.heroCardValue}>
              <CountUp to={SAMPLE_SCORE} duration={0.7} />
              <span className={styles.heroCardMax}>/100</span>
            </p>
            <div
              className={styles.heroScoreTrack}
              role="progressbar"
              aria-valuenow={SAMPLE_SCORE}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Sample ATS score"
            >
              <motion.div
                className={styles.heroScoreFill}
                initial={reduced ? { scaleX: 1 } : { scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }
                }
                style={{ originX: 0 }}
              />
            </div>
          </div>

          <motion.ul
            className={styles.heroCardList}
            variants={reduced ? undefined : staggerFast}
            initial={reduced ? false : "hidden"}
            animate="show"
          >
            {SAMPLE_ROWS.map((row) => (
              <motion.li
                key={row.label}
                variants={reduced ? undefined : rowIn}
              >
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </motion.li>
            ))}
          </motion.ul>
        </motion.aside>
      </div>
    </section>
  );
}
