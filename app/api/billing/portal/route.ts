import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getCreemConfig } from "@/lib/creem/config";
import { createCustomerPortalLink } from "@/lib/creem/checkout";
import { getSubscription } from "@/lib/creem/subscriptions";

export const runtime = "nodejs";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const sub = await getSubscription(user.id);
    const cfg = await getCreemConfig();
    const customerId = sub?.creem_customer_id ?? null;

    if (!customerId && !cfg.portalFallbackUrl) {
      return NextResponse.json(
        {
          error:
            "No Creem customer on file yet. After your first payment, manage billing from the Creem customer portal email, or ask support.",
          instructions:
            "Cancel or update payment method from the receipt email Creem sent, or open the customer portal link in your Creem dashboard for this customer.",
        },
        { status: 404 },
      );
    }

    const url = await createCustomerPortalLink({
      cfg,
      customerId: customerId || "",
    });

    if (!url) {
      return NextResponse.json(
        {
          error: "Customer portal unavailable",
          instructions:
            "Open your Creem receipt email and use Manage subscription, or cancel from the Creem customer portal.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Portal failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
