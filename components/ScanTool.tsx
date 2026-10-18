"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
} from "motion/react";
import Link from "next/link";
import { CountUp } from "./motion/CountUp";
import { useMotionReady } from "./motion/useMotionReady";
import {
  fadeUp,
  scanIssuesContainer,
  scanResultTiming,
} from "./motion/variants";
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
  premium?: boolean;
  canSave?: boolean;
  tier?: string;
  quota: {
    used: number;
    limit: number | null;
    remaining: number | null;
    unlimited?: boolean;
  };
  source: string;
};

type Quota = {
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited?: boolean;
  tier?: string;
};

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

const RING_R = 46;
const RING_C = 2 * Math.PI * RING_R;

/** SVG ring + CountUp — same phase; no fake loading spinner */
function ScoreRing({
  score,
  color,
  run,
  replayKey,
}: {
  score: number;
  color: string;
  run: boolean;
  replayKey: string | number;
}) {
  const progress = Math.min(100, Math.max(0, score)) / 100;
  const finalOffset = RING_C * (1 - progress);

  return (
    <div
      className={styles.ring}
      role="img"
      aria-label={`ATS score ${score} out of 100`}
    >
      <svg className={styles.ringSvg} viewBox="0 0 108 108" aria-hidden="true">
        <g transform="rotate(-90 54 54)">
          <circle className={styles.ringTrack} cx="54" cy="54" r={RING_R} />
          <motion.circle
            key={`ring-${replayKey}`}
            className={styles.ringFill}
            cx="54"
            cy="54"
            r={RING_R}
            stroke={color}
            strokeDasharray={RING_C}
            initial={run ? { strokeDashoffset: RING_C } : { strokeDashoffset: finalOffset }}
            animate={{ strokeDashoffset: finalOffset }}
            transition={
              run
                ? {
                    duration: scanResultTiming.scoreDuration,
                    ease: scanResultTiming.ease,
                    delay: scanResultTiming.scoreDelay,
                  }
                : { duration: 0 }
            }
          />
        </g>
      </svg>
      <div className={styles.ringCenter}>
        {run ? (
          <CountUp
            className={styles.ringValue}
            to={score}
            duration={scanResultTiming.scoreDuration}
            delay={scanResultTiming.scoreDelay}
            replayKey={replayKey}
          />
        ) : (
          <span className={styles.ringValue}>{score}</span>
        )}
      </div>
    </div>
  );
}

export function ScanTool() {
  const { reduced, run } = useMotionReady();
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [jd, setJd] = useState("");
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanOk | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [premium, setPremium] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [scanKey, setScanKey] = useState(0);

  useEffect(() => {
    fetch("/api/scan")
      .then((r) => r.json())
      .then((d) => {
        setQuota(d.quota);
        setPremium(Boolean(d.premium));
      })
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
      const ok = data as ScanOk;
      setResult(ok);
      setScanKey((k) => k + 1);
      setQuota(ok.quota);
      setPremium(Boolean(ok.premium));
      setCanSave(Boolean(ok.canSave));
      setSaveMsg(null);
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

  const replayKey = result
    ? `${scanKey}-${result.score}-${result.wordCount}`
    : 0;

  return (
    <motion.div
      className={styles.shell}
      id="scan-tool"
      initial={run ? { opacity: 0, y: 16 } : false}
      whileInView={run ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        ease: scanResultTiming.ease,
      }}
    >
      <div className={styles.panel}>
        <div className={styles.panelHead}>
          <h2>Free ATS resume scan</h2>
          <span className={styles.quota}>
            {quota?.unlimited
              ? "Unlimited (Pro)"
              : quota && quota.remaining != null && quota.limit != null
                ? `${quota.remaining} of ${quota.limit} free left today`
                : "3 free scans / day"}
          </span>
        </div>

        <div
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
        </div>

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
          <button
            type="button"
            className={styles.primary}
            disabled={loading}
            onClick={runScan}
          >
            {loading ? "Scanning…" : "Check ATS score"}
          </button>
          <button
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
          >
            Reset
          </button>
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
              initial={run ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
            >
              Upload or paste a resume to see a 0–100 score, fix list, and keyword
              gaps. No account required.
            </motion.p>
          ) : (
            <motion.div
              key={replayKey}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? undefined : { opacity: 0, y: -6 }}
              transition={{
                duration: scanResultTiming.shellDuration,
                ease: scanResultTiming.ease,
              }}
            >
              <div className={styles.scoreHero}>
                <ScoreRing
                  score={result.score}
                  color={tone?.color ?? "#2dd4bf"}
                  run={run}
                  replayKey={replayKey}
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

              {/* Bars same phase as ring∥CountUp */}
              <div className={styles.bars}>
                {(Object.keys(BAR_LABEL) as (keyof Breakdown)[]).map((k) => {
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
                            run ? { width: "0%" } : { width: `${pct}%` }
                          }
                          animate={{ width: `${pct}%` }}
                          transition={{
                            duration: run ? scanResultTiming.barDuration : 0,
                            delay: run ? scanResultTiming.barDelay : 0,
                            ease: scanResultTiming.ease,
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
                  Free plan shows top {result.issues.length} of{" "}
                  {result.issuesTotal} issues.{" "}
                  <Link href="/pricing">Upgrade to Pro</Link> for the full list.
                </p>
              ) : null}
              <motion.ul
                className={styles.issueList}
                variants={run ? scanIssuesContainer : undefined}
                initial={run ? "hidden" : false}
                animate="show"
              >
                {result.issues.map((issue) => (
                  <motion.li
                    key={issue.id}
                    className={styles.issue}
                    variants={run ? fadeUp : undefined}
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
                    {result.matchedKeywords.slice(0, 16).map((k) => (
                      <span
                        key={k}
                        className={`${styles.chip} ${styles.chipOk}`}
                      >
                        {k}
                      </span>
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
                    {result.missingKeywords.map((k) => (
                      <span
                        key={k}
                        className={`${styles.chip} ${styles.chipMiss}`}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </>
              ) : null}

              <div className={styles.row} style={{ marginTop: "1rem" }}>
                {canSave ? (
                  <button
                    type="button"
                    className={styles.ghost}
                    disabled={saving}
                    onClick={async () => {
                      setSaving(true);
                      setSaveMsg(null);
                      try {
                        const res = await fetch("/api/scans", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            score: result.score,
                            breakdown: result.breakdown,
                            issues: result.issues,
                            matchedKeywords: result.matchedKeywords,
                            missingKeywords: result.missingKeywords,
                            hasJobDescription: result.hasJobDescription,
                            wordCount: result.wordCount,
                            source: result.source,
                            resultSummary: {
                              score: result.score,
                              issuesTotal: result.issuesTotal,
                              missingTotal: result.missingTotal,
                            },
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Save failed");
                        setSaveMsg("Saved to history.");
                      } catch (e) {
                        setSaveMsg(
                          e instanceof Error ? e.message : "Save failed",
                        );
                      } finally {
                        setSaving(false);
                      }
                    }}
                  >
                    {saving ? "Saving…" : "Save to history"}
                  </button>
                ) : (
                  <Link href="/pricing" className={styles.ghost}>
                    Unlock unlimited + history
                  </Link>
                )}
                {premium ? (
                  <Link href="/history" className={styles.ghost}>
                    View history
                  </Link>
                ) : null}
              </div>
              {saveMsg ? <p className={styles.truncatedNote}>{saveMsg}</p> : null}

              <p className={styles.disclaimer}>{result.disclaimer}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
