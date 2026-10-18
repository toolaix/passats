import { NextResponse } from "next/server";
import { requirePremiumUser } from "@/lib/api-gate";
import { deleteSavedScan, getSavedScan } from "@/lib/scans";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const gate = await requirePremiumUser();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const row = await getSavedScan(gate.user.id, id);
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({
      scan: {
        id: row.id,
        title: row.title,
        score: row.score,
        breakdown: JSON.parse(row.breakdown_json),
        issues: JSON.parse(row.issues_json),
        matchedKeywords: JSON.parse(row.matched_keywords_json || "[]"),
        missingKeywords: JSON.parse(row.missing_keywords_json || "[]"),
        hasJobDescription: Boolean(row.has_jd),
        wordCount: row.word_count,
        source: row.source,
        result: JSON.parse(row.result_json),
        createdAt: row.created_at,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const gate = await requirePremiumUser();
  if (gate.error) return gate.error;
  const { id } = await ctx.params;
  try {
    const ok = await deleteSavedScan(gate.user.id, id);
    if (!ok) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
