import { NextResponse } from "next/server";
import { verifyLogin } from "@/lib/auth/otp";
import {
  createSession,
  findOrCreateUser,
  setSessionCookie,
} from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      email?: string;
      code?: string;
      token?: string;
    };
    const { email } = await verifyLogin(body);
    const user = await findOrCreateUser(email);
    const sessionId = await createSession(user.id);
    await setSessionCookie(sessionId);
    return NextResponse.json({ ok: true, user: { id: user.id, email: user.email } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Verify failed";
    const status = message.includes("D1") || message.includes("Cannot reach")
      ? 503
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
