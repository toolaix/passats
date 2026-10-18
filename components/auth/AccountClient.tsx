"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./AuthShell.module.css";

type Me = {
  authenticated: boolean;
  user: { id: string; email: string } | null;
  premium: boolean;
  subscription: {
    plan: string | null;
    status: string | null;
    currentPeriodEnd: string | null;
    creemCustomerId: string | null;
    creemSubscriptionId: string | null;
  } | null;
  error?: string;
};

function formatPeriodEnd(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return (
      new Date(iso).toLocaleString("en-US", {
        timeZone: "Asia/Shanghai",
        dateStyle: "medium",
        timeStyle: "short",
      }) + " (Asia/Shanghai)"
    );
  } catch {
    return iso;
  }
}

export function AccountClient() {
  const router = useRouter();
  const search = useSearchParams();
  const upgraded = search.get("upgraded") === "1";
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [portalBusy, setPortalBusy] = useState(false);
  const [portalMsg, setPortalMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/me");
      const data = (await res.json()) as Me;
      if (!res.ok) throw new Error(data.error || "Failed");
      setMe(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setPortalMsg(null);
    setPortalBusy(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        instructions?: string;
      };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setPortalMsg(
        data.instructions ||
          data.error ||
          "Billing portal unavailable. Use the manage link in your Creem receipt email.",
      );
    } catch (e) {
      setPortalMsg(e instanceof Error ? e.message : "Portal failed");
    } finally {
      setPortalBusy(false);
    }
  }

  if (error) {
    return (
      <div className={styles.card}>
        <p className={styles.error}>{error}</p>
      </div>
    );
  }

  if (!me) {
    return (
      <div className={styles.card}>
        <p className={styles.hint}>Loading account…</p>
      </div>
    );
  }

  if (!me.authenticated) {
    return (
      <div className={`${styles.card} ${styles.gate}`}>
        <h2>You&apos;re signed out</h2>
        <p>Sign in to manage Pro and saved scans.</p>
        <div className={styles.actions} style={{ justifyContent: "center" }}>
          <Link href="/login" className={styles.btn}>
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const sub = me.subscription;
  const planLabel = me.premium
    ? sub?.plan === "yearly"
      ? "Pro yearly"
      : sub?.plan === "monthly"
        ? "Pro monthly"
        : "Pro (active)"
    : "Free";

  return (
    <>
      {upgraded && (
        <p className={styles.success}>
          Thanks — if Creem just redirected you here, Pro unlocks after the
          webhook lands (usually a few seconds). Refresh if scans still show
          the free limit.
        </p>
      )}

      <div className={styles.statusRow}>
        <div className={styles.statusPill}>
          <strong>Email</strong>
          {me.user?.email}
        </div>
        <div className={styles.statusPill}>
          <strong>Plan</strong>
          {planLabel}
        </div>
        {sub?.status && (
          <div className={styles.statusPill}>
            <strong>Status</strong>
            {sub.status}
          </div>
        )}
        {sub?.currentPeriodEnd && (
          <div className={styles.statusPill}>
            <strong>Renews / ends</strong>
            {formatPeriodEnd(sub.currentPeriodEnd)}
          </div>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.cardHead}>
          <h2>Quick links</h2>
          <span className={me.premium ? styles.badge : styles.badgeWarn}>
            {me.premium ? "Pro" : "Free"}
          </span>
        </div>
        <div className={styles.actions}>
          <Link href="/#scan" className={styles.btn}>
            Scan resume
          </Link>
          {me.premium && (
            <Link href="/history" className={styles.btnGhost}>
              Scan history
            </Link>
          )}
          {!me.premium && (
            <Link href="/pricing" className={styles.btnGhost}>
              Upgrade
            </Link>
          )}
          {me.premium && (
            <button
              type="button"
              className={styles.btnGhost}
              disabled={portalBusy}
              onClick={() => void openPortal()}
            >
              {portalBusy ? "Opening…" : "Manage billing"}
            </button>
          )}
          <button
            type="button"
            className={styles.btnGhost}
            disabled={busy}
            onClick={() => void logout()}
          >
            {busy ? "Signing out…" : "Sign out"}
          </button>
        </div>
        {portalMsg && (
          <p className={styles.hint} style={{ marginTop: "1rem" }}>
            {portalMsg}
          </p>
        )}
        {!me.premium && (
          <p className={styles.hint} style={{ marginTop: "1rem" }}>
            For local Pro without Creem, set <code>DEV_PREMIUM=1</code> in{" "}
            <code>.dev.vars</code> and restart <code>npm run dev</code>.
          </p>
        )}
      </div>
    </>
  );
}
