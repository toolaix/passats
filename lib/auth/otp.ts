import { getDB, getEnv } from "@/lib/db";
import { newId, nowIso, otpCode, plusMinutesIso } from "@/lib/ids";

const OTP_TTL_MIN = 15;

export type RequestLoginResult = {
  ok: true;
  email: string;
  /** Present in local/dev when no Resend key — code is also logged server-side. */
  devCode?: string;
  /** Magic-link path for local testing. */
  devMagicPath?: string;
  message: string;
};

function isDevMailMode(resendKey: string | undefined): boolean {
  return !resendKey;
}

async function sendResendEmail(opts: {
  apiKey: string;
  from: string;
  to: string;
  code: string;
  magicUrl: string;
}): Promise<void> {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opts.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opts.from,
      to: [opts.to],
      subject: "Your PassATS sign-in code",
      text: `Your code is ${opts.code}\n\nOr open: ${opts.magicUrl}\n\nExpires in ${OTP_TTL_MIN} minutes.`,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend failed (${res.status}): ${body}`);
  }
}

export async function requestLogin(emailRaw: string): Promise<RequestLoginResult> {
  const email = emailRaw.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid email address.");
  }

  const db = await getDB();
  const env = await getEnv();
  const code = otpCode();
  const token = newId("tok");
  const id = newId("lt");
  const expiresAt = plusMinutesIso(OTP_TTL_MIN);

  await db.prepare("DELETE FROM login_tokens WHERE email = ?").bind(email).run();
  await db
    .prepare(
      `INSERT INTO login_tokens (id, email, code, token, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(id, email, code, token, expiresAt, nowIso())
    .run();

  const base =
    env?.APP_BASE_URL ||
    process.env.APP_BASE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const magicPath = `/login?email=${encodeURIComponent(email)}&token=${token}`;
  const magicUrl = `${base.replace(/\/$/, "")}${magicPath}`;

  const resendKey = env?.RESEND_API_KEY || process.env.RESEND_API_KEY;
  const from =
    env?.EMAIL_FROM ||
    process.env.EMAIL_FROM ||
    "PassATS <onboarding@resend.dev>";

  if (isDevMailMode(resendKey)) {
    console.info(
      `\n[PassATS DEV AUTH]\n  email: ${email}\n  code:  ${code}\n  link:  ${magicUrl}\n`,
    );
    return {
      ok: true,
      email,
      devCode: code,
      devMagicPath: magicPath,
      message:
        "Dev mode: no RESEND_API_KEY — code logged to the server console and returned in this response.",
    };
  }

  await sendResendEmail({
    apiKey: resendKey!,
    from,
    to: email,
    code,
    magicUrl,
  });

  return {
    ok: true,
    email,
    message: "Check your email for a 6-digit code (or magic link).",
  };
}

export async function verifyLogin(opts: {
  email?: string;
  code?: string;
  token?: string;
}): Promise<{ email: string }> {
  const db = await getDB();
  const now = nowIso();

  let row: { email: string; id: string } | null = null;

  if (opts.token) {
    row = await db
      .prepare(
        `SELECT id, email FROM login_tokens
         WHERE token = ? AND expires_at > ?`,
      )
      .bind(opts.token, now)
      .first<{ id: string; email: string }>();
  } else if (opts.email && opts.code) {
    const email = opts.email.trim().toLowerCase();
    const code = opts.code.trim();
    row = await db
      .prepare(
        `SELECT id, email FROM login_tokens
         WHERE email = ? AND code = ? AND expires_at > ?`,
      )
      .bind(email, code, now)
      .first<{ id: string; email: string }>();
  }

  if (!row) {
    throw new Error("Invalid or expired code. Request a new one.");
  }

  await db.prepare("DELETE FROM login_tokens WHERE email = ?").bind(row.email).run();
  return { email: row.email };
}
