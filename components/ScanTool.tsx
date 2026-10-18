"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { CountUp } from "./motion/CountUp";
import { fadeUp, staggerFast } from "./motion/variants";
import styles from "./ScanTool.module.css";

type Breakdown = {
  sections: number;
  contact: number;
  verbsQuant: number;
  keywords: number;
  risks: number;
};

type Issue = {
  id: string;
  severity: "high" | "medium" | "low";
  title: string;
  detail: string;
  howToFix: string;
};

type ScanOk = {
  ok: true;
  score: number;
  breakdown: Breakdown;
  issues: Issue[];
  issuesTruncated: boolean;
  issuesTotal: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  missingTruncated: boolean;
  missingTotal: number;
  hasJobDescription: boolean;
  wordCount: number;
  detectedSections: string[];
  disclaimer: string;
  quota: { used: number; limit: number; remaining: number };
  source: string;
};

type Quota = { used: number; limit: number; remaining: number };

function scoreTone(score: number) {
  if (score >= 80) return { label: "Strong ATS readiness", color: "#34d399" };
  if (score >= 60) return { label: "Decent — fix a few issues", color: "#2dd4bf" };
  if (score >= 40) return { label: "Needs work before applying", color: "#fbbf24" };
  return { label: "High risk of parse / keyword gaps", color: "#fb7185" };
}

const BAR_MAX: Record<keyof Breakdown, number> = {
  sections: 25,
  contact: 15,
  verbsQuant: 30,
  keywords: 25,
  risks: 15,
};

const BAR_LABEL: Record<keyof Breakdown, string> = {
  sections: "Sections",
  contact: "Contact",
  verbsQuant: "Impact",
  keywords: "Keywords",
  risks: "Layout",
};

function AnimatedRing({
  score,
  color,
  reduced,
}: {
  score: number;
  color: string;
  reduced: boolean | null;
}) {
  const [progress, setProgress] = useState(reduced ? score : 0);

  useEffect(() => {
    if (reduced) {
      setProgress(score);
      return;
    }
    setProgress(0);
    let raf = 0;
    const start = performance.now();
    const dur = 900;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      // ease-out cubic
      const e = 1 - Math.pow(1 - t, 3);
      setProgress(Math.round(score * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score, reduced]);

  return (
    <div
      className={styles.ring}
      style={
        {
          "--p": progress,
          "--ring-color": color,
        } as React.CSSProperties
      }
    >
      <CountUp
        className={styles.ringValue}
        to={score}
        duration={0.9}
        replayKey={score}
      />
    </div>
  );
}

export function ScanTool() {
  const reduced = useReducedMotion();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [jd, setJd] = useState("");
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanOk | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);

  useEffect(() => {
    fetch("/api/scan")
      .then((r) => r.json())
      .then((d) => setQuota(d.quota))
      .catch(() => undefined);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  }, []);

  async function runScan() {
    setLoading(true);
    setError(null);
    try {
      const fd = new FormData();
      if (file) fd.set("file", file);
      if (text.trim()) fd.set("text", text);
      if (jd.trim()) fd.set("jobDescription", jd);
      const res = await fetch("/api/scan", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setQuota(
          data.limit != null
            ? { used: data.used, limit: data.limit, remaining: data.remaining ?? 0 }
            : quota,
        );
        throw new Error(data.error || "Scan failed");
      }
      setResult(data as ScanOk);
      setQuota(data.quota);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  }

  const tone = useMemo(
    () => (result ? scoreTone(result.score) : null),
    [result],
  );

  return (
    <motion.div
      className={styles.shell}
      id="scan-tool"
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Free ATS resume scan</h2>
          <span className={styles.quota}>
            {quota
              ? `${quota.remaining} of ${quota.limit} free left today`
              : "3 free scans / day"}
          </span>
        </div>

        <motion.div
          className={`${styles.drop} ${drag ? styles.dropActive : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          onClick={() => document.getElementById("resume-file")?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              document.getElementById("resume-file")?.click();
            }
          }}
          whileHover={
            reduced
              ? undefined
              : {
                  scale: 1.01,
                  borderColor: "rgba(45, 212, 191, 0.75)",
                  backgroundColor: "rgba(45, 212, 191, 0.14)",
                }
          }
          whileTap={reduced ? undefined : { scale: 0.99 }}
          animate={
            drag && !reduced
              ? {
                  scale: 1.02,
                  borderColor: "rgba(45, 212, 191, 0.9)",
                  backgroundColor: "rgba(45, 212, 191, 0.16)",
                }
              : undefined
          }
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <p className={styles.dropTitle}>Drop PDF or DOCX</p>
          <p className={styles.dropMeta}>Max 5MB · text-based files work best</p>
          <AnimatePresence mode="wait">
            {file ? (
              <motion.p
                key={file.name}
                className={styles.fileName}
                initial={reduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
              >
                {file.name}
              </motion.p>
            ) : null}
          </AnimatePresence>
          <input
            id="resume-file"
            className="sr-only"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </motion.div>

        <label className={styles.label} htmlFor="paste">
          Or paste resume text
        </label>
        <textarea
          id="paste"
          className={styles.textarea}
          placeholder="Paste plain resume text if you prefer not to upload a file…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <label className={styles.label} htmlFor="jd">
          Job description (optional — unlocks keyword gaps)
        </label>
        <textarea
          id="jd"
          className={styles.textarea}
          placeholder="Paste the job posting to see missing keywords…"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
        />

        <div className={styles.row}>
          <motion.button
            type="button"
            className={styles.primary}
            disabled={loading}
            onClick={runScan}
            whileHover={
              reduced || loading ? undefined : { scale: 1.03, y: -1 }
            }
            whileTap={reduced || loading ? undefined : { scale: 0.96 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            {loading ? "Scanning…" : "Check ATS score"}
          </motion.button>
          <motion.button
            type="button"
            className={styles.ghost}
            disabled={loading}
            onClick={() => {
              setFile(null);
              setText("");
              setJd("");
              setResult(null);
              setError(null);
            }}
            whileTap={reduced || loading ? undefined : { scale: 0.96 }}
          >
            Reset
          </motion.button>
        </div>

        <AnimatePresence>
          {error ? (
            <motion.p
              className={styles.error}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0 }}
            >
              {error}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Your ATS resume score</h2>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.p
              key="empty"
              className={styles.empty}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
            >
              Upload or paste a resume to see a 0–100 score, fix list, and keyword
              gaps. No account required.
            </motion.p>
          ) : (
            <motion.div
              key={`result-${result.score}-${result.wordCount}`}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={styles.scoreHero}>
                <AnimatedRing
                  score={result.score}
                  color={tone?.color ?? "#2dd4bf"}
                  reduced={reduced}
                />
                <div>
                  <p className={styles.scoreLabel}>ATS-oriented estimate</p>
                  <p className={styles.scoreTitle}>{tone?.label}</p>
                  <p className={styles.scoreSub}>
                    {result.wordCount} words · sections:{" "}
                    {result.detectedSections.join(", ") || "none"}
                    {result.hasJobDescription ? " · JD matched" : " · no JD"}
                  </p>
                </div>
              </div>

              <div className={styles.bars}>
                {(Object.keys(BAR_LABEL) as (keyof Breakdown)[]).map((k, i) => {
                  const max = BAR_MAX[k];
                  const val = result.breakdown[k];
                  const pct = Math.min(100, Math.round((val / max) * 100));
                  return (
                    <div className={styles.barRow} key={k}>
                      <span className={styles.barLabel}>{BAR_LABEL[k]}</span>
                      <div className={styles.barTrack}>
                        <motion.div
                          className={styles.barFill}
                          initial={
                            reduced ? { width: `${pct}%` } : { width: "0%" }
                          }
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: reduced ? 0 : 0.7,
                            delay: reduced ? 0 : 0.15 + i * 0.06,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        />
                      </div>
                      <span className={styles.barVal}>
                        {val}/{max}
                      </span>
                    </div>
                  );
                })}
              </div>

              <h3 className={styles.sectionTitle}>
                Issues ({result.issues.length}
                {result.issuesTruncated ? ` of ${result.issuesTotal}` : ""})
              </h3>
              {result.issuesTruncated ? (
                <p className={styles.truncatedNote}>
                  Free plan shows top {result.issues.length} issues. Full list
                  unlocks with Pro later.
                </p>
              ) : null}
              <motion.ul
                className={styles.issueList}
                variants={reduced ? undefined : staggerFast}
                initial={reduced ? false : "hidden"}
                animate="show"
              >
                {result.issues.map((issue) => (
                  <motion.li
                    key={issue.id}
                    className={styles.issue}
                    variants={reduced ? undefined : fadeUp}
                  >
                    <div className={styles.issueHead}>
                      <span
                        className={`${styles.badge} ${styles[issue.severity]}`}
                      >
                        {issue.severity}
                      </span>
                      <p className={styles.issueTitle}>{issue.title}</p>
                    </div>
                    <p className={styles.issueDetail}>{issue.detail}</p>
                    <p className={styles.issueFix}>Fix: {issue.howToFix}</p>
                  </motion.li>
                ))}
              </motion.ul>

              {result.matchedKeywords.length > 0 ? (
                <>
                  <h3 className={styles.sectionTitle}>Matched keywords</h3>
                  <div className={styles.chips}>
                    {result.matchedKeywords.slice(0, 16).map((k, i) => (
                      <motion.span
                        key={k}
                        className={`${styles.chip} ${styles.chipOk}`}
                        initial={
                          reduced ? false : { opacity: 0, scale: 0.9 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: reduced ? 0 : 0.2 + i * 0.03,
                          duration: 0.3,
                        }}
                      >
                        {k}
                      </motion.span>
                    ))}
                  </div>
                </>
              ) : null}

              {result.missingKeywords.length > 0 ? (
                <>
                  <h3 className={styles.sectionTitle}>
                    Missing keywords
                    {result.missingTruncated
                      ? ` (${result.missingKeywords.length} of ${result.missingTotal})`
                      : ""}
                  </h3>
                  <div className={styles.chips}>
                    {result.missingKeywords.map((k, i) => (
                      <motion.span
                        key={k}
                        className={`${styles.chip} ${styles.chipMiss}`}
                        initial={
                          reduced ? false : { opacity: 0, scale: 0.9 }
                        }
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: reduced ? 0 : 0.25 + i * 0.03,
                          duration: 0.3,
                        }}
                      >
                        {k}
                      </motion.span>
                    ))}
                  </div>
                </>
              ) : null}

              <p className={styles.disclaimer}>{result.disclaimer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
