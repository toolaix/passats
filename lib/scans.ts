import { getDB } from "@/lib/db";
import { newId, nowIso } from "@/lib/ids";

export type SavedScanRow = {
  id: string;
  user_id: string;
  title: string;
  score: number;
  breakdown_json: string;
  issues_json: string;
  matched_keywords_json: string | null;
  missing_keywords_json: string | null;
  has_jd: number;
  word_count: number | null;
  source: string | null;
  result_json: string;
  created_at: string;
};

export type SaveScanInput = {
  userId: string;
  title?: string;
  score: number;
  breakdown: unknown;
  issues: unknown;
  matchedKeywords?: string[];
  missingKeywords?: string[];
  hasJobDescription: boolean;
  wordCount?: number;
  source?: string;
  /** Summary payload only — never store full resume text. */
  resultSummary: unknown;
};

export async function listSavedScans(userId: string): Promise<SavedScanRow[]> {
  const db = await getDB();
  const res = await db
    .prepare(
      `SELECT * FROM saved_scans WHERE user_id = ? ORDER BY created_at DESC LIMIT 100`,
    )
    .bind(userId)
    .all<SavedScanRow>();
  return res.results ?? [];
}

export async function getSavedScan(
  userId: string,
  id: string,
): Promise<SavedScanRow | null> {
  const db = await getDB();
  return db
    .prepare(`SELECT * FROM saved_scans WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .first<SavedScanRow>();
}

export async function saveScan(input: SaveScanInput): Promise<SavedScanRow> {
  const db = await getDB();
  const id = newId("scn");
  const created = nowIso();
  const title =
    input.title?.trim() ||
    `Scan ${new Date(created).toLocaleDateString("en-US")} · ${input.score}`;

  await db
    .prepare(
      `INSERT INTO saved_scans (
         id, user_id, title, score, breakdown_json, issues_json,
         matched_keywords_json, missing_keywords_json, has_jd,
         word_count, source, result_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      input.userId,
      title,
      input.score,
      JSON.stringify(input.breakdown),
      JSON.stringify(input.issues),
      JSON.stringify(input.matchedKeywords ?? []),
      JSON.stringify(input.missingKeywords ?? []),
      input.hasJobDescription ? 1 : 0,
      input.wordCount ?? null,
      input.source ?? null,
      JSON.stringify(input.resultSummary),
      created,
    )
    .run();

  const row = await getSavedScan(input.userId, id);
  if (!row) throw new Error("Failed to save scan");
  return row;
}

export async function deleteSavedScan(userId: string, id: string): Promise<boolean> {
  const db = await getDB();
  const res = await db
    .prepare(`DELETE FROM saved_scans WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .run();
  return (res.meta as { changes?: number }).changes === 1;
}
