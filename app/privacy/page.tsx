import type { Metadata } from "next";
import { site } from "@/site.config";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${site.name} handles resume uploads.`,
};

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ color: "#fff", letterSpacing: "-0.03em" }}>Privacy</h1>
      <p style={{ color: "var(--muted)" }}>
        Last updated: October 18, 2026 (Asia/Shanghai context).
      </p>
      <p style={{ color: "var(--muted-strong)", lineHeight: 1.6 }}>
        On the free scanner (W1), resume and job-description text are processed
        in memory for your HTTP request to produce a score. We do not write
        resume bodies to a database or object store. A small cookie tracks how
        many free scans you used today (count only — not file contents).
      </p>
      <p style={{ color: "var(--muted-strong)", lineHeight: 1.6 }}>
        Future Pro features (saved history) will store content only when you
        explicitly save a scan, with clear consent. Do not upload passwords,
        government IDs, or other secrets.
      </p>
    </main>
  );
}
