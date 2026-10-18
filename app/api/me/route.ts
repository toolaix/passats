import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { isPremium } from "@/lib/premium";
import { getSubscription } from "@/lib/creem/subscriptions";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null,
        premium: false,
        subscription: null,
      });
    }
    const premium = await isPremium(user.id);
    const sub = await getSubscription(user.id);
    return NextResponse.json({
      authenticated: true,
      user: { id: user.id, email: user.email },
      premium,
      subscription: sub
        ? {
            plan: sub.plan,
            status: sub.status,
            currentPeriodEnd: sub.current_period_end,
            creemCustomerId: sub.creem_customer_id,
            creemSubscriptionId: sub.creem_subscription_id,
          }
        : null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
