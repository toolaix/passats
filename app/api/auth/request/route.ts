import { NextResponse } from "next/server";
import { requestLogin } from "@/lib/auth/otp";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    if (!body.email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }
    const result = await requestLogin(body.email);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Request failed";
    const status = message.includes("D1") || message.includes("Cannot reach")
      ? 503
      : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
