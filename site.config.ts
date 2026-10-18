/**
 * PassATS — free ATS resume checker (one-keyword SEO tool).
 */
export const site = {
  name: "PassATS",
  primaryKeyword: "ats resume checker",
  tagline:
    "Upload your resume. Get an ATS score, fix list, and missing job keywords — free, no signup required.",
  domain: "passats.pages.dev",
  locale: "en-US",
  kind: "checker" as const,
  monetization: {
    model: "freemium" as const,
    creemCheckoutUrl: "",
    freeQuotaLabel: "3 free scans / day",
    premiumPriceLabel: "$12 / mo — unlimited scans & full reports",
    premiumPriceMonthly: 12,
    premiumPriceYearly: 79,
  },
  seo: {
    titleTemplate: "%s | PassATS",
    description:
      "Free ATS resume checker and scan. Score your PDF or DOCX, see issues, and match keywords to a job description — no account required.",
    longTails: [
      "free ats resume scan",
      "ats resume score",
      "resume ats checker",
      "ats score checker",
      "best ats resume checker free",
      "workday ats resume checker",
    ],
  },
  limits: {
    freeScansPerDay: 3,
    freeIssuesShown: 5,
    freeMissingKeywordsShown: 8,
    maxUploadBytes: 5 * 1024 * 1024,
  },
  analytics: {
    cloudflareBeaconToken: "",
  },
  gsc: {
    verificationMeta: "",
  },
} as const;
