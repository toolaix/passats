"use client";

import { motion } from "motion/react";
import { site } from "@/site.config";
import { CountUp } from "./motion/CountUp";
import { useMotionReady } from "./motion/useMotionReady";
import {
  heroActions,
  heroCard,
  heroCardLabel,
  heroCopyContainer,
  heroEyebrow,
  heroLead,
  heroPills,
  heroRow,
  heroRowsContainer,
  heroScoreBlock,
  heroTiming,
  heroTitle,
} from "./motion/variants";
import styles from "@/app/home.module.css";

const SAMPLE_ROWS = [
  { label: "Sections & contact", value: "38/40" },
  { label: "Impact language", value: "22/30" },
  { label: "JD keywords", value: "18/25" },
  { label: "Layout risk", value: "Clean" },
] as const;

const SAMPLE_SCORE = 84;
const RING_R = 54;
const RING_C = 2 * Math.PI * RING_R;

export function HomeHero() {
  const { reduced, run, initial } = useMotionReady();
  const progress = SAMPLE_SCORE / 100;
  const finalOffset = RING_C * (1 - progress);

  return (
    <section className={styles.hero}>
      <div className={styles.heroInner}>
        <motion.div
          variants={run ? heroCopyContainer : undefined}
          initial={initial}
          animate="show"
        >
          <motion.p
            className={styles.eyebrow}
            variants={run ? heroEyebrow : undefined}
          >
            Free ATS resume scan · no signup
          </motion.p>
          <motion.h1 variants={run ? heroTitle : undefined}>
            ATS resume checker that shows what to fix
          </motion.h1>
          <motion.p
            className={styles.lead}
            variants={run ? heroLead : undefined}
          >
            {site.tagline}
          </motion.p>
          <motion.div
            className={styles.actions}
            variants={run ? heroActions : undefined}
          >
            <motion.a
              className={styles.primaryBtn}
              href="#scan"
              whileTap={reduced ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            >
              Start free scan
            </motion.a>
            <motion.a
              className={styles.ghostBtn}
              href="#how"
              whileTap={reduced ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            >
              How scoring works
            </motion.a>
          </motion.div>
          <motion.div
            className={styles.pills}
            variants={run ? heroPills : undefined}
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
          variants={run ? heroCard : undefined}
          initial={initial}
          animate="show"
          whileHover={
            reduced
              ? undefined
              : {
                  y: -2,
                  transition: { type: "spring", stiffness: 360, damping: 30 },
                }
          }
        >
          <motion.p
            className={styles.heroCardLabel}
            variants={run ? heroCardLabel : undefined}
            initial={initial}
            animate="show"
          >
            Example result
          </motion.p>

          <motion.div
            className={styles.heroScoreRing}
            variants={run ? heroScoreBlock : undefined}
            initial={initial}
            animate="show"
            role="img"
            aria-label={`Sample ATS score ${SAMPLE_SCORE} out of 100`}
          >
            <svg
              className={styles.heroScoreSvg}
              viewBox="0 0 120 120"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="heroScoreGrad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#5eead4" />
                </linearGradient>
              </defs>
              <g transform="rotate(-90 60 60)">
                <circle
                  className={styles.heroScoreTrack}
                  cx="60"
                  cy="60"
                  r={RING_R}
                />
                <motion.circle
                  className={styles.heroScoreFill}
                  cx="60"
                  cy="60"
                  r={RING_R}
                  strokeDasharray={RING_C}
                  initial={
                    run
                      ? { strokeDashoffset: RING_C }
                      : { strokeDashoffset: finalOffset }
                  }
                  animate={{ strokeDashoffset: finalOffset }}
                  transition={
                    run
                      ? {
                          duration: heroTiming.scoreDuration,
                          ease: heroTiming.ease,
                          delay: heroTiming.scoreDelay,
                        }
                      : { duration: 0 }
                  }
                />
              </g>
            </svg>
            <div className={styles.heroScoreCenter}>
              <p className={styles.heroCardValue}>
                {run ? (
                  <CountUp
                    to={SAMPLE_SCORE}
                    duration={heroTiming.scoreDuration}
                    delay={heroTiming.scoreDelay}
                  />
                ) : (
                  <span>{SAMPLE_SCORE}</span>
                )}
                <span className={styles.heroCardMax}>/100</span>
              </p>
            </div>
          </motion.div>

          <motion.ul
            className={styles.heroCardList}
            variants={run ? heroRowsContainer : undefined}
            initial={initial}
            animate="show"
          >
            {SAMPLE_ROWS.map((row) => (
              <motion.li
                key={row.label}
                variants={run ? heroRow : undefined}
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
