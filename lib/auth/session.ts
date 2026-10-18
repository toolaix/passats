import { cookies } from "next/headers";
import { getDB } from "@/lib/db";
import { newId, nowIso, plusDaysIso } from "@/lib/ids";

export const SESSION_COOKIE = "passats_sid";
const SESSION_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
};

type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
  email: string;
};

export async function createSession(userId: string): Promise<string> {
  const db = await getDB();
  const id = newId("ses");
  const expiresAt = plusDaysIso(SESSION_DAYS);
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(id, userId, expiresAt)
    .run();
  return id;
}

export async function setSessionCookie(sessionId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });
}

export async function destroySession(sessionId: string): Promise<void> {
  const db = await getDB();
  await db.prepare("DELETE FROM sessions WHERE id = ?").bind(sessionId).run();
}

export async function getSessionIdFromCookies(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(SESSION_COOKIE)?.value ?? null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const sessionId = await getSessionIdFromCookies();
  if (!sessionId) return null;

  const db = await getDB();
  const row = await db
    .prepare(
      `SELECT s.id, s.user_id, s.expires_at, u.email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`,
    )
    .bind(sessionId)
    .first<SessionRow>();

  if (!row) return null;
  if (row.expires_at < nowIso()) {
    await destroySession(sessionId);
    return null;
  }
  return { id: row.user_id, email: row.email };
}

/** Soft lookup — returns null if D1/session unavailable (anonymous scan still works). */
export async function tryGetCurrentUser(): Promise<SessionUser | null> {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}

export async function findOrCreateUser(email: string): Promise<SessionUser> {
  const db = await getDB();
  const normalized = email.trim().toLowerCase();
  const existing = await db
    .prepare("SELECT id, email FROM users WHERE email = ?")
    .bind(normalized)
    .first<{ id: string; email: string }>();
  if (existing) return existing;

  const id = newId("usr");
  await db
    .prepare("INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)")
    .bind(id, normalized, nowIso())
    .run();
  return { id, email: normalized };
}
