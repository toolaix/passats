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

export type ScanQuota = {
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  tier: "anonymous" | "signed_in" | "premium";
};

export function freeLimitForTier(tier: "anonymous" | "signed_in" | "premium"): number {
  if (tier === "premium") return Number.POSITIVE_INFINITY;
  if (tier === "signed_in") return site.limits.signedInScansPerDay;
  return site.limits.freeScansPerDay;
}

export async function getScanQuota(opts?: {
  unlimited?: boolean;
  tier?: ScanQuota["tier"];
}): Promise<ScanQuota> {
  const tier = opts?.tier ?? "anonymous";
  if (opts?.unlimited || tier === "premium") {
    return {
      used: 0,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
      unlimited: true,
      tier: "premium",
    };
  }
  const jar = await cookies();
  const bucket = parseBucket(jar.get(COOKIE)?.value);
  const limit = freeLimitForTier(tier);
  return {
    used: bucket.count,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    unlimited: false,
    tier,
  };
}

/** Returns false if over limit. Caller should still set cookie when incrementing. */
export async function consumeScan(opts?: {
  unlimited?: boolean;
  tier?: ScanQuota["tier"];
}): Promise<{
  ok: boolean;
  used: number;
  limit: number;
  remaining: number;
  unlimited: boolean;
  tier: ScanQuota["tier"];
  setCookieValue: string | null;
}> {
  const tier = opts?.tier ?? "anonymous";
  if (opts?.unlimited || tier === "premium") {
    return {
      ok: true,
      used: 0,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
      unlimited: true,
      tier: "premium",
      setCookieValue: null,
    };
  }

  const jar = await cookies();
  const bucket = parseBucket(jar.get(COOKIE)?.value);
  const limit = freeLimitForTier(tier);
  if (bucket.count >= limit) {
    return {
      ok: false,
      used: bucket.count,
      limit,
      remaining: 0,
      unlimited: false,
      tier,
      setCookieValue: JSON.stringify(bucket),
    };
  }
  const next: DayBucket = { day: bucket.day, count: bucket.count + 1 };
  return {
    ok: true,
    used: next.count,
    limit,
    remaining: Math.max(0, limit - next.count),
    unlimited: false,
    tier,
    setCookieValue: JSON.stringify(next),
  };
}

export const SCAN_COOKIE = COOKIE;
