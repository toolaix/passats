import type { Metadata } from "next";
import { site } from "@/site.config";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: `Free ATS Resume Checker — Score & Keyword Scan | ${site.name}`,
    template: site.seo.titleTemplate,
  },
  description: site.seo.description,
  keywords: [site.primaryKeyword, ...site.seo.longTails],
  metadataBase: new URL(`https://${site.domain}`),
  openGraph: {
    title: `Free ATS Resume Checker | ${site.name}`,
    description: site.seo.description,
    type: "website",
  },
  verification: site.gsc.verificationMeta
    ? { google: site.gsc.verificationMeta }
    : undefined,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SiteNav />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
