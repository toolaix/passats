import { NextResponse } from "next/server";
import { requirePremiumUser } from "@/lib/api-gate";
import { listSavedScans, saveScan } from "@/lib/scans";

export const runtime = "nodejs";

export async function GET() {
  const gate = await requirePremiumUser();
  if (gate.error) return gate.error;
  try {
    const rows = await listSavedScans(gate.user.id);
    return NextResponse.json({
      scans: rows.map((r) => ({
        id: r.id,
        title: r.title,
        score: r.score,
        hasJd: Boolean(r.has_jd),
        wordCount: r.word_count,
        source: r.source,
        createdAt: r.created_at,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(req: Request) {
  const gate = await requirePremiumUser();
  if (gate.error) return gate.error;
  try {
    const body = (await req.json()) as {
      title?: string;
      score?: number;
      breakdown?: unknown;
      issues?: unknown;
      matchedKeywords?: string[];
      missingKeywords?: string[];
      hasJobDescription?: boolean;
      wordCount?: number;
      source?: string;
      resultSummary?: unknown;
    };
    if (typeof body.score !== "number" || !body.breakdown || !body.issues) {
      return NextResponse.json(
        { error: "score, breakdown, and issues are required" },
        { status: 400 },
      );
    }
    const row = await saveScan({
      userId: gate.user.id,
      title: body.title,
      score: body.score,
      breakdown: body.breakdown,
      issues: body.issues,
      matchedKeywords: body.matchedKeywords,
      missingKeywords: body.missingKeywords,
      hasJobDescription: Boolean(body.hasJobDescription),
      wordCount: body.wordCount,
      source: body.source,
      resultSummary: body.resultSummary ?? {
        score: body.score,
        issuesCount: Array.isArray(body.issues) ? body.issues.length : 0,
      },
    });
    return NextResponse.json({
      ok: true,
      scan: {
        id: row.id,
        title: row.title,
        score: row.score,
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
