"use client";

import { useState } from "react";
import Link from "next/link";
import { site } from "@/site.config";
import styles from "@/app/pricing/pricing.module.css";

type Plan = "monthly" | "yearly";

export function PricingCheckout() {
  const [busy, setBusy] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(plan: Plan) {
    setError(null);
    setBusy(plan);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as {
        url?: string;
        error?: string;
        loginUrl?: string;
      };
      if (res.status === 401) {
        window.location.href = data.loginUrl || "/login?next=/pricing";
        return;
      }
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
      setBusy(null);
    }
  }

  const monthly = site.monetization.premiumPriceMonthly;
  const yearly = site.monetization.premiumPriceYearly;

  return (
    <>
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>Free</h2>
          <p className={styles.price}>
            $0<span>/ forever</span>
          </p>
          <ul>
            <li>{site.monetization.freeQuotaLabel}</li>
            <li>Score + top issues</li>
            <li>Keyword gaps (truncated)</li>
            <li>No account required</li>
          </ul>
          <Link href="/#scan" className={styles.btnGhost}>
            Start free scan
          </Link>
        </div>

        <div className={`${styles.card} ${styles.featured}`}>
          <div className={styles.tag}>Recommended</div>
          <h2>Pro</h2>
          <p className={styles.price}>
            ${monthly}<span>/ mo</span>
          </p>
          <p className={styles.alt}>or ${yearly} / year — about 3 months free</p>
          <ul>
            <li>Unlimited scans</li>
            <li>Full issue &amp; keyword lists</li>
            <li>Saved scan history</li>
            <li>PDF report export (soon)</li>
          </ul>

          <div className={styles.ctaStack}>
            <button
              type="button"
              className={styles.btn}
              disabled={busy !== null}
              onClick={() => void startCheckout("monthly")}
            >
              {busy === "monthly"
                ? "Redirecting…"
                : `Go Pro — $${monthly}/mo`}
            </button>
            <button
              type="button"
              className={styles.btnSecondary}
              disabled={busy !== null}
              onClick={() => void startCheckout("yearly")}
            >
              {busy === "yearly"
                ? "Redirecting…"
                : `Save with yearly — $${yearly}/yr`}
            </button>
          </div>

          <p className={styles.note}>
            You&apos;ll sign in first if needed. Checkout runs on Creem (card).
            Cancel anytime from Account → Manage billing.
          </p>
        </div>
      </div>

      {error && <p className={styles.errorBanner}>{error}</p>}

      <div className={styles.faqStrip}>
        <div>
          <strong>What do I get?</strong>
          <p>
            Unlimited ATS scans, full keyword lists, and cloud-saved history —
            no resume plaintext stored unless you save a summary.
          </p>
        </div>
        <div>
          <strong>Can I stay on Free?</strong>
          <p>
            Yes. The checker stays free forever with a daily quota. Pro is only
            for unlimited + history.
          </p>
        </div>
        <div>
          <strong>How do I cancel?</strong>
          <p>
            Open Account after purchase and use Manage billing (Creem customer
            portal), or the link in your receipt email.
          </p>
        </div>
      </div>
    </>
  );
}
