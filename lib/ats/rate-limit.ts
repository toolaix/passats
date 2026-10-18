import { cookies } from "next/headers";
import { site } from "@/site.config";

const COOKIE = "passats_scans";

type DayBucket = {
  day: string; // YYYY-MM-DD UTC
  count: number;
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseBucket(raw: string | undefined): DayBucket {
  const day = todayUtc();
  if (!raw) return { day, count: 0 };
  try {
    const j = JSON.parse(raw) as DayBucket;
    if (j.day !== day) return { day, count: 0 };
    return { day, count: Math.max(0, Number(j.count) || 0) };
  } catch {
    return { day, count: 0 };
  }
}

export async function getScanQuota(): Promise<{
  used: number;
  limit: number;
  remaining: number;
}> {
  const jar = await cookies();
  const bucket = parseBucket(jar.get(COOKIE)?.value);
  const limit = site.limits.freeScansPerDay;
  return {
    used: bucket.count,
    limit,
    remaining: Math.max(0, limit - bucket.count),
  };
}

/** Returns false if over limit. Caller should still set cookie when incrementing. */
export async function consumeScan(): Promise<{
  ok: boolean;
  used: number;
  limit: number;
  remaining: number;
  setCookieValue: string;
}> {
  const jar = await cookies();
  const bucket = parseBucket(jar.get(COOKIE)?.value);
  const limit = site.limits.freeScansPerDay;
  if (bucket.count >= limit) {
    return {
      ok: false,
      used: bucket.count,
      limit,
      remaining: 0,
      setCookieValue: JSON.stringify(bucket),
    };
  }
  const next: DayBucket = { day: bucket.day, count: bucket.count + 1 };
  return {
    ok: true,
    used: next.count,
    limit,
    remaining: Math.max(0, limit - next.count),
    setCookieValue: JSON.stringify(next),
  };
}

export const SCAN_COOKIE = COOKIE;
