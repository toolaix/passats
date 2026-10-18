import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import styles from "@/components/auth/AuthShell.module.css";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to PassATS with an email code — no password.",
};

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <p className={styles.crumb}>
        <a href="/">Home</a> / Sign in
      </p>
      <p className={styles.eyebrow}>Account</p>
      <h1 className={styles.title}>Sign in to PassATS</h1>
      <p className={styles.lead}>
        Email a one-time code to unlock Pro features: unlimited scans, full
        keywords, and saved history.
      </p>
      <Suspense
        fallback={
          <div className={styles.card}>
            <p className={styles.hint}>Loading…</p>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
