import { getDB, getEnv } from "@/lib/db";
import { nowIso } from "@/lib/ids";

const PREMIUM_STATUSES = new Set([
  "active",
  "trialing",
  "scheduled_cancel",
]);

/**
 * Premium gate:
 * - DEV_PREMIUM=1 → always premium (local / staging without Creem)
 * - else subscriptions.status ∈ {active, trialing, scheduled_cancel}
 *   and current_period_end > now (if set)
 */
export async function isPremium(userId: string | null | undefined): Promise<boolean> {
  const env = await getEnv();
  const flag = env?.DEV_PREMIUM || process.env.DEV_PREMIUM || "";
  if (flag === "1" || flag.toLowerCase() === "true") {
    return true;
  }
  if (!userId) return false;

  const db = await getDB();
  const row = await db
    .prepare(
      `SELECT status, current_period_end FROM subscriptions WHERE user_id = ?`,
    )
    .bind(userId)
    .first<{ status: string; current_period_end: string | null }>();

  if (!row) return false;
  if (!PREMIUM_STATUSES.has(row.status)) return false;
  if (!row.current_period_end) return true;
  return row.current_period_end > nowIso();
}
