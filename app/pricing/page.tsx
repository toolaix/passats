import type { Metadata } from "next";
import { PricingCheckout } from "@/components/pricing/PricingCheckout";
import { site } from "@/site.config";
import styles from "./pricing.module.css";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    `PassATS Pro — $${site.monetization.premiumPriceMonthly}/mo or $${site.monetization.premiumPriceYearly}/yr. Unlimited scans and saved history.`,
};

export default function PricingPage() {
  return (
    <div className={styles.wrap}>
      <p className={styles.eyebrow}>Simple pricing</p>
      <h1 className={styles.title}>ATS checks that scale with your job search</h1>
      <p className={styles.lead}>
        Free scans forever. Pro unlocks unlimited runs, full keyword lists, and
        saved history.
      </p>

      <PricingCheckout />
    </div>
  );
}
