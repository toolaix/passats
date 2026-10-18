"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "./AuthShell.module.css";

type Step = "email" | "code";

type ApiPayload = {
  error?: string;
  message?: string;
  devCode?: string;
  devMagicPath?: string;
};

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const nextPath = search.get("next") || "/account";
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const token = search.get("token");
    const qEmail = search.get("email");
    if (qEmail) setEmail(qEmail);
    if (!token) return;

    let cancelled = false;
    (async () => {
      setBusy(true);
      setError(null);
      try {
        const res = await fetch("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email: qEmail ?? undefined }),
        });
        const data = (await res.json()) as ApiPayload;
        if (!res.ok) throw new Error(data.error || "Magic link failed");
        if (!cancelled) router.replace(nextPath);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Magic link failed");
          setStep("email");
        }
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [search, router, nextPath]);

  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setDevCode(null);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as ApiPayload;
      if (!res.ok) throw new Error(data.error || "Could not send code");
      setMessage(data.message ?? null);
      if (data.devCode) setDevCode(data.devCode);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = (await res.json()) as ApiPayload;
      if (!res.ok) throw new Error(data.error || "Invalid code");
      router.replace(nextPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verify failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <h2>{step === "email" ? "Email sign-in" : "Enter your code"}</h2>
        <span className={styles.badge}>No password</span>
      </div>

      {step === "email" ? (
        <form onSubmit={requestCode}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <p className={styles.hint}>
                We email a 6-digit code (or magic link). Locally, the code is
                printed in the server console when Resend is not configured.
              </p>
            </div>
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button className={styles.btn} type="submit" disabled={busy}>
              {busy ? "Sending…" : "Send code"}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={verifyCode}>
          <div className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="code">Code for {email}</label>
              <input
                id="code"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                pattern="[0-9]{6}"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="6-digit code"
              />
            </div>
          </div>
          {devCode && (
            <div className={styles.devBox}>
              Dev code: <code>{devCode}</code>
              <p className={styles.hint} style={{ marginTop: "0.4rem" }}>
                Also logged as <code>[PassATS DEV AUTH]</code> in the terminal
                running <code>npm run dev</code>.
              </p>
            </div>
          )}
          {message && !devCode && <p className={styles.success}>{message}</p>}
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.actions}>
            <button className={styles.btn} type="submit" disabled={busy}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <button
              type="button"
              className={styles.btnGhost}
              disabled={busy}
              onClick={() => {
                setStep("email");
                setCode("");
                setDevCode(null);
                setError(null);
              }}
            >
              Use a different email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
