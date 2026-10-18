"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/components/auth/AuthShell.module.css";
import hist from "./History.module.css";

type Detail = {
  id: string;
  title: string;
  score: number;
  issues: { id: string; severity: string; title: string; detail: string }[];
  missingKeywords: string[];
  matchedKeywords: string[];
  createdAt: string;
};

export function HistoryDetail() {
  const search = useSearchParams();
  const id = search.get("id");
  const [detail, setDetail] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/scans/${id}`);
        const data = (await res.json()) as { scan?: Detail; error?: string };
        if (!res.ok) throw new Error(data.error || "Failed");
        if (!cancelled) setDetail(data.scan || null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (!id) return null;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!detail) {
    return (
      <div className={styles.card}>
        <p className={styles.hint}>Loading scan…</p>
      </div>
    );
  }

  return (
    <div className={hist.detail}>
      <h3>
        {detail.title} · {detail.score}
      </h3>
      <p className={styles.hint}>
        Saved{" "}
        {new Date(detail.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Shanghai",
          dateStyle: "medium",
          timeStyle: "short",
        })}{" "}
        (Asia/Shanghai). Summary only — resume text was not stored.
      </p>
      <p className={styles.hint} style={{ marginTop: "0.75rem" }}>
        Issues: {detail.issues.length} · Missing keywords:{" "}
        {detail.missingKeywords.length} · Matched:{" "}
        {detail.matchedKeywords.length}
      </p>
      <ul style={{ marginTop: "0.75rem", paddingLeft: "1.1rem", color: "var(--muted-strong)" }}>
        {detail.issues.slice(0, 12).map((i) => (
          <li key={i.id}>
            <strong>{i.title}</strong> — {i.detail}
          </li>
        ))}
      </ul>
    </div>
  );
}
