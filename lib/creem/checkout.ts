import {
  type BillingPlan,
  type CreemConfig,
  checkoutFallbackUrl,
  productIdForPlan,
} from "@/lib/creem/config";

export type CheckoutResult = {
  url: string;
  mode: "api" | "fallback";
  checkoutId?: string;
};

/**
 * Create a Creem checkout session via API, or fall back to a static product URL
 * with request_id / client_reference_id = userId (Boyd pastes product links).
 */
export async function createCheckoutForUser(opts: {
  cfg: CreemConfig;
  plan: BillingPlan;
  userId: string;
  email: string;
}): Promise<CheckoutResult> {
  const { cfg, plan, userId, email } = opts;
  const productId = productIdForPlan(cfg, plan);
  const fallback = checkoutFallbackUrl(cfg, plan);

  if (cfg.apiKey && productId) {
    const res = await fetch(`${cfg.apiBase.replace(/\/$/, "")}/v1/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": cfg.apiKey,
      },
      body: JSON.stringify({
        product_id: productId,
        request_id: userId,
        success_url: cfg.successUrl,
        customer: { email },
        metadata: {
          user_id: userId,
          plan,
        },
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      checkout_url?: string;
      id?: string;
      message?: string;
      error?: string;
    };
    if (!res.ok || !data.checkout_url) {
      // Fall through to static URL if configured
      if (fallback) {
        return {
          url: appendUserRef(fallback, userId, plan),
          mode: "fallback",
        };
      }
      throw new Error(
        data.message ||
          data.error ||
          `Creem checkout failed (${res.status}). Check CREEM_API_KEY and product ids.`,
      );
    }
    return { url: data.checkout_url, mode: "api", checkoutId: data.id };
  }

  if (fallback) {
    return {
      url: appendUserRef(fallback, userId, plan),
      mode: "fallback",
    };
  }

  throw new Error(
    "Creem is not configured. Set CREEM_API_KEY + CREEM_PRICE_MONTHLY/YEARLY, or CREEM_CHECKOUT_URL_MONTHLY/YEARLY.",
  );
}

function appendUserRef(baseUrl: string, userId: string, plan: BillingPlan): string {
  try {
    const u = new URL(baseUrl);
    u.searchParams.set("request_id", userId);
    u.searchParams.set("client_reference_id", userId);
    u.searchParams.set("plan", plan);
    return u.toString();
  } catch {
    const sep = baseUrl.includes("?") ? "&" : "?";
    return `${baseUrl}${sep}request_id=${encodeURIComponent(userId)}&client_reference_id=${encodeURIComponent(userId)}&plan=${plan}`;
  }
}

export async function createCustomerPortalLink(opts: {
  cfg: CreemConfig;
  customerId: string;
}): Promise<string | null> {
  const { cfg, customerId } = opts;
  if (cfg.apiKey && customerId) {
    const res = await fetch(
      `${cfg.apiBase.replace(/\/$/, "")}/v1/customers/billing`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": cfg.apiKey,
        },
        body: JSON.stringify({ customer_id: customerId }),
      },
    );
    const data = (await res.json().catch(() => ({}))) as {
      customer_portal_link?: string;
    };
    if (res.ok && data.customer_portal_link) {
      return data.customer_portal_link;
    }
  }
  return cfg.portalFallbackUrl || null;
}
