import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCreemConfig, type BillingPlan } from "@/lib/creem/config";
import { createCheckoutForUser } from "@/lib/creem/checkout";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Sign in required", loginUrl: "/login?next=/pricing" },
        { status: 401 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as { plan?: string };
    const planRaw = (body.plan || "monthly").toLowerCase();
    const plan: BillingPlan = planRaw === "yearly" ? "yearly" : "monthly";

    const cfg = await getCreemConfig();
    const result = await createCheckoutForUser({
      cfg,
      plan,
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      url: result.url,
      mode: result.mode,
      plan,
      checkoutId: result.checkoutId ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
