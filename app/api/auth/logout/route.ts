import { NextResponse } from "next/server";
import {
  clearSessionCookie,
  destroySession,
  getSessionIdFromCookies,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST() {
  try {
    const sid = await getSessionIdFromCookies();
    if (sid) {
      try {
        await destroySession(sid);
      } catch {
        // D1 may be down — still clear cookie
      }
    }
    await clearSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Logout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
