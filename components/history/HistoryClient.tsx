"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/components/auth/AuthShell.module.css";
import hist from "./History.module.css";

type ScanItem = {
  id: string;
  title: string;
  score: number;
  hasJd: boolean;
  wordCount: number | null;
  source: string | null;
  createdAt: string;
};

export function HistoryClient() {
  const [scans, setScans] = useState<ScanItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setCode(null);
    try {
      const res = await fetch("/api/scans");
      const data = (await res.json()) as {
        scans?: ScanItem[];
        error?: string;
        code?: string;
      };
      if (res.status === 401) {
        setCode("auth_required");
        setError("Sign in required.");
        setScans([]);
        return;
      }
      if (res.status === 402) {
        setCode("premium_required");
        setError("Pro required for saved history.");
        setScans([]);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Failed to load history");
      setScans(data.scans || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
      setScans([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/scans/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error || "Delete failed");
      }
      setScans((prev) => (prev ? prev.filter((s) => s.id !== id) : prev));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  if (scans === null) {
    return (
      <div className={styles.card}>
        <p className={styles.hint}>Loading history…</p>
      </div>
    );
  }

  if (code === "auth_required") {
    return (
      <div className={`${styles.card} ${styles.gate}`}>
        <h2>Sign in to view history</h2>
        <p>Saved scans are available on Pro after you create an account.</p>
        <div className={styles.actions} style={{ justifyContent: "center" }}>
          <Link href="/login?next=/history" className={styles.btn}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  if (code === "premium_required") {
    return (
      <div className={`${styles.card} ${styles.gate}`}>
        <h2>Pro unlocks saved history</h2>
        <p>
          Upgrade to keep score summaries and reopen past scans. Resume
          plaintext is never stored by default.
        </p>
        <div className={styles.actions} style={{ justifyContent: "center" }}>
          <Link href="/pricing" className={styles.btn}>
            See pricing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <p className={styles.error}>{error}</p>}
      {scans.length === 0 ? (
        <div className={`${styles.card} ${styles.gate}`}>
          <h2>No saved scans yet</h2>
          <p>Run a scan and tap Save to history on the result panel.</p>
          <div className={styles.actions} style={{ justifyContent: "center" }}>
            <Link href="/#scan" className={styles.btn}>
              Scan resume
            </Link>
          </div>
        </div>
      ) : (
        <ul className={hist.list}>
          {scans.map((s) => (
            <li key={s.id} className={hist.item}>
              <div>
                <p className={hist.title}>{s.title}</p>
                <p className={hist.meta}>
                  Score {s.score}
                  {s.hasJd ? " · JD matched" : ""}
                  {s.wordCount ? ` · ${s.wordCount} words` : ""}
                  {" · "}
                  {new Date(s.createdAt).toLocaleString("en-US", {
                    timeZone: "Asia/Shanghai",
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}{" "}
                  (Asia/Shanghai)
                </p>
              </div>
              <div className={hist.actions}>
                <Link href={`/history?id=${s.id}`} className={styles.btnGhost}>
                  Open
                </Link>
                <button
                  type="button"
                  className={styles.btnGhost}
                  disabled={busyId === s.id}
                  onClick={() => void remove(s.id)}
                >
                  {busyId === s.id ? "…" : "Delete"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
