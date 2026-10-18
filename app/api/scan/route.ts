import { NextResponse } from "next/server";
import { scoreResume } from "@/lib/ats/score";
import { parseUpload } from "@/lib/ats/parse";
import { consumeScan, getScanQuota, SCAN_COOKIE } from "@/lib/ats/rate-limit";
import { tryGetCurrentUser } from "@/lib/auth/session";
import { isPremium } from "@/lib/premium";
import { site } from "@/site.config";

export const runtime = "nodejs";

function truncateForFree<T>(items: T[], n: number): { items: T[]; truncated: boolean } {
  if (items.length <= n) return { items, truncated: false };
  return { items: items.slice(0, n), truncated: true };
}

async function resolveAccess(): Promise<{
  tier: "anonymous" | "signed_in" | "premium";
  unlimited: boolean;
  userId: string | null;
}> {
  const user = await tryGetCurrentUser();
  if (!user) return { tier: "anonymous", unlimited: false, userId: null };
  let premium = false;
  try {
    premium = await isPremium(user.id);
  } catch {
    premium = false;
  }
  if (!premium) {
    const flag = process.env.DEV_PREMIUM || "";
    if (flag === "1" || flag.toLowerCase() === "true") premium = true;
  }
  if (premium) return { tier: "premium", unlimited: true, userId: user.id };
  return { tier: "signed_in", unlimited: false, userId: user.id };
}

export async function POST(req: Request) {
  try {
    const access = await resolveAccess();
    const quota = await consumeScan({
      unlimited: access.unlimited,
      tier: access.tier,
    });
    if (!quota.ok) {
      const res = NextResponse.json(
        {
          error: "Daily free scan limit reached",
          code: "RATE_LIMIT",
          used: quota.used,
          limit: quota.limit,
          remaining: 0,
          tier: quota.tier,
          upgradeHint: site.monetization.premiumPriceLabel,
          pricingUrl: "/pricing",
        },
        { status: 429 },
      );
      if (quota.setCookieValue) {
        res.cookies.set(SCAN_COOKIE, quota.setCookieValue, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          maxAge: 60 * 60 * 48,
        });
      }
      return res;
    }

    const form = await req.formData();
    const file = form.get("file");
    const paste = String(form.get("text") || "");
    const jd = String(form.get("jobDescription") || "");

    const upload = await parseUpload(
      file instanceof File ? file : null,
      paste || null,
    );

    const result = scoreResume({
      resumeText: upload.text,
      jobDescription: jd || undefined,
    });

    const showFull = access.unlimited;
    const issuesCap = showFull
      ? { items: result.issues, truncated: false }
      : truncateForFree(result.issues, site.limits.freeIssuesShown);
    const missingCap = showFull
      ? { items: result.missingKeywords, truncated: false }
      : truncateForFree(
          result.missingKeywords,
          site.limits.freeMissingKeywordsShown,
        );

    const res = NextResponse.json({
      ok: true,
      source: upload.source,
      score: result.score,
      breakdown: result.breakdown,
      issues: issuesCap.items,
      issuesTruncated: issuesCap.truncated,
      issuesTotal: result.issues.length,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: missingCap.items,
      missingTruncated: missingCap.truncated,
      missingTotal: result.missingKeywords.length,
      hasJobDescription: result.hasJobDescription,
      wordCount: result.wordCount,
      detectedSections: result.detectedSections,
      disclaimer: result.disclaimer,
      premium: access.unlimited,
      tier: access.tier,
      canSave: access.unlimited && Boolean(access.userId),
      quota: {
        used: quota.used,
        limit: quota.unlimited ? null : quota.limit,
        remaining: quota.unlimited ? null : quota.remaining,
        unlimited: quota.unlimited,
      },
    });

    if (quota.setCookieValue) {
      res.cookies.set(SCAN_COOKIE, quota.setCookieValue, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 48,
      });
    }

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message, code: "SCAN_ERROR" }, { status: 400 });
  }
}

export async function GET() {
  const access = await resolveAccess();
  const q = await getScanQuota({
    unlimited: access.unlimited,
    tier: access.tier,
  });
  return NextResponse.json({
    quota: {
      used: q.used,
      limit: q.unlimited ? null : q.limit,
      remaining: q.unlimited ? null : q.remaining,
      unlimited: q.unlimited,
      tier: q.tier,
    },
    premium: access.unlimited,
  });
}
