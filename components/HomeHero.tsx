"use client";

import { motion, useReducedMotion } from "motion/react";
import { site } from "@/site.config";
import { CountUp } from "./motion/CountUp";
import {
  fadeUp,
  floatY,
  scaleIn,
  staggerContainer,
} from "./motion/variants";
import styles from "@/app/home.module.css";

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
          style={{ originY: 0.5 }}
        >
          <motion.div
            variants={reduced ? undefined : floatY}
            initial="rest"
            animate={reduced ? "rest" : "float"}
          >
            <p className={styles.heroCardLabel}>Example result</p>
            <p className={styles.heroCardValue}>
              <CountUp to={84} duration={1.1} />
            </p>
            <ul className={styles.heroCardList}>
              <li>
                Sections & contact <strong>38/40</strong>
              </li>
              <li>
                Impact language <strong>22/30</strong>
              </li>
              <li>
                JD keywords <strong>18/25</strong>
              </li>
              <li>
                Layout risk <strong>Clean</strong>
              </li>
            </ul>
          </motion.div>
        </motion.aside>
      </div>
    </section>
  );
}
