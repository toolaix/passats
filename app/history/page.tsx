import type { Metadata } from "next";
import { Suspense } from "react";
import { HistoryClient } from "@/components/history/HistoryClient";
import { HistoryDetail } from "@/components/history/HistoryDetail";
import styles from "@/components/auth/AuthShell.module.css";

export const metadata: Metadata = {
  title: "Scan history",
  description: "Saved ATS scan summaries on PassATS Pro.",
};

export default function HistoryPage() {
  return (
    <div className={`${styles.page} ${styles.wide}`}>
      <p className={styles.crumb}>
        <a href="/">Home</a> / History
      </p>
      <p className={styles.eyebrow}>Pro</p>
      <h1 className={styles.title}>Saved scans</h1>
      <p className={styles.lead}>
        Score summaries and issue lists you chose to keep. Resume plaintext is
        never stored by default.
      </p>
      <Suspense
        fallback={
          <div className={styles.card}>
            <p className={styles.hint}>Loading…</p>
          </div>
        }
      >
        <HistoryClient />
        <HistoryDetail />
      </Suspense>
    </div>
  );
}
