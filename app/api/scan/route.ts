import { NextResponse } from "next/server";
import { scoreResume } from "@/lib/ats/score";
import { parseUpload } from "@/lib/ats/parse";
import { consumeScan, SCAN_COOKIE } from "@/lib/ats/rate-limit";
import { site } from "@/site.config";

export const runtime = "nodejs";

function truncateForFree<T>(items: T[], n: number): { items: T[]; truncated: boolean } {
  if (items.length <= n) return { items, truncated: false };
  return { items: items.slice(0, n), truncated: true };
}

export async function POST(req: Request) {
  try {
    const quota = await consumeScan();
    if (!quota.ok) {
      const res = NextResponse.json(
        {
          error: "Daily free scan limit reached",
          code: "RATE_LIMIT",
          used: quota.used,
          limit: quota.limit,
          remaining: 0,
          upgradeHint: site.monetization.premiumPriceLabel,
        },
        { status: 429 },
      );
      res.cookies.set(SCAN_COOKIE, quota.setCookieValue, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 48,
      });
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

    // Score in-memory only — do not persist resume text
    const result = scoreResume({
      resumeText: upload.text,
      jobDescription: jd || undefined,
    });

    const issuesCap = truncateForFree(
      result.issues,
      site.limits.freeIssuesShown,
    );
    const missingCap = truncateForFree(
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
      quota: {
        used: quota.used,
        limit: quota.limit,
        remaining: quota.remaining,
      },
    });

    res.cookies.set(SCAN_COOKIE, quota.setCookieValue, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 48,
    });

    return res;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Scan failed";
    return NextResponse.json({ error: message, code: "SCAN_ERROR" }, { status: 400 });
  }
}

export async function GET() {
  const { getScanQuota } = await import("@/lib/ats/rate-limit");
  const q = await getScanQuota();
  return NextResponse.json({ quota: q });
}
