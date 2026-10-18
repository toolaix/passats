import { NextResponse } from "next/server";
import { getCurrentUser, type SessionUser } from "@/lib/auth/session";
import { isPremium } from "@/lib/premium";

export type PremiumUser = SessionUser;

export async function requireUser(): Promise<
  | { user: SessionUser; error?: undefined }
  | { user?: undefined; error: NextResponse }
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        error: NextResponse.json(
          { error: "Sign in required.", code: "auth_required" },
          { status: 401 },
        ),
      };
    }
    return { user };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return {
      error: NextResponse.json({ error: message }, { status: 503 }),
    };
  }
}

export async function requirePremiumUser(): Promise<
  | { user: PremiumUser; error?: undefined }
  | { user?: undefined; error: NextResponse }
> {
  const base = await requireUser();
  if (base.error || !base.user) return base;
  try {
    const premium = await isPremium(base.user.id);
    if (!premium) {
      return {
        error: NextResponse.json(
          { error: "Pro required.", code: "premium_required" },
          { status: 402 },
        ),
      };
    }
    return { user: base.user };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return {
      error: NextResponse.json({ error: message }, { status: 503 }),
    };
  }
}
