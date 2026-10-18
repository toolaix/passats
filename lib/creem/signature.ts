import { createHmac, timingSafeEqual } from "crypto";

/** HMAC-SHA256 hex of raw body with webhook secret (Creem `creem-signature` header). */
export function computeCreemSignature(rawBody: string, secret: string): string {
  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}

export function verifyCreemSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string,
): boolean {
  if (!secret || !signatureHeader) return false;
  const expected = computeCreemSignature(rawBody, secret);
  const provided = signatureHeader.trim();
  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(provided, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return expected === provided;
  }
}
