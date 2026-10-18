import type { Metadata } from "next";
import { Suspense } from "react";
import { AccountClient } from "@/components/auth/AccountClient";
import styles from "@/components/auth/AuthShell.module.css";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your PassATS session, Pro plan, and billing.",
};

export default function AccountPage() {
  return (
    <div className={styles.page}>
      <p className={styles.crumb}>
        <a href="/">Home</a> / Account
      </p>
      <p className={styles.eyebrow}>Account</p>
      <h1 className={styles.title}>Your account</h1>
      <p className={styles.lead}>
        Session, Pro status from Creem webhooks, and billing portal.
      </p>
      <Suspense
        fallback={
          <div className={styles.card}>
            <p className={styles.hint}>Loading account…</p>
          </div>
        }
      >
        <AccountClient />
      </Suspense>
    </div>
  );
}
