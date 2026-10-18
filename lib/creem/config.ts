import { getEnv } from "@/lib/db";

export type BillingPlan = "monthly" | "yearly";

export type CreemConfig = {
  apiKey: string;
  webhookSecret: string;
  apiBase: string;
  priceMonthly: string;
  priceYearly: string;
  checkoutUrlMonthly: string;
  checkoutUrlYearly: string;
  successUrl: string;
  portalFallbackUrl: string;
};

async function readVar(name: string): Promise<string> {
  const env = await getEnv();
  const fromCf = env ? (env as unknown as Record<string, string | undefined>)[name] : undefined;
  const fromProcess = process.env[name];
  return (fromCf || fromProcess || "").trim();
}

export async function getCreemConfig(): Promise<CreemConfig> {
  const appBase =
    (await readVar("APP_BASE_URL")) ||
    process.env.APP_BASE_URL ||
    "http://localhost:3000";
  const successOverride = await readVar("CREEM_SUCCESS_URL");
  return {
    apiKey: await readVar("CREEM_API_KEY"),
    webhookSecret: await readVar("CREEM_WEBHOOK_SECRET"),
    apiBase: (await readVar("CREEM_API_BASE")) || "https://api.creem.io",
    priceMonthly: await readVar("CREEM_PRICE_MONTHLY"),
    priceYearly: await readVar("CREEM_PRICE_YEARLY"),
    checkoutUrlMonthly:
      (await readVar("CREEM_CHECKOUT_URL_MONTHLY")) ||
      (await readVar("NEXT_PUBLIC_CREEM_CHECKOUT_URL")),
    checkoutUrlYearly: await readVar("CREEM_CHECKOUT_URL_YEARLY"),
    successUrl:
      successOverride ||
      `${appBase.replace(/\/$/, "")}/account?upgraded=1`,
    portalFallbackUrl: await readVar("CREEM_CUSTOMER_PORTAL_URL"),
  };
}

export function productIdForPlan(cfg: CreemConfig, plan: BillingPlan): string {
  return plan === "yearly" ? cfg.priceYearly : cfg.priceMonthly;
}

export function checkoutFallbackUrl(cfg: CreemConfig, plan: BillingPlan): string {
  return plan === "yearly" ? cfg.checkoutUrlYearly : cfg.checkoutUrlMonthly;
}

export function planFromProductId(
  cfg: CreemConfig,
  productId: string | null | undefined,
  billingPeriod?: string | null,
): BillingPlan {
  if (productId && productId === cfg.priceYearly) return "yearly";
  if (productId && productId === cfg.priceMonthly) return "monthly";
  if (billingPeriod === "every-year") return "yearly";
  return "monthly";
}
