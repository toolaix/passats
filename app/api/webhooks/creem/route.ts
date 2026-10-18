import { NextResponse } from "next/server";
import { getCreemConfig } from "@/lib/creem/config";
import { verifyCreemSignature } from "@/lib/creem/signature";
import { applyCreemWebhookEvent } from "@/lib/creem/subscriptions";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const rawBody = await req.text();
  const cfg = await getCreemConfig();

  if (!cfg.webhookSecret) {
    console.error("[creem webhook] CREEM_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 503 },
    );
  }

  const signature =
    req.headers.get("creem-signature") ||
    req.headers.get("Creem-Signature");

  if (!verifyCreemSignature(rawBody, signature, cfg.webhookSecret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: {
    id?: string;
    eventType?: string;
    object?: Record<string, unknown>;
  };
  try {
    payload = JSON.parse(rawBody) as typeof payload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  try {
    const result = await applyCreemWebhookEvent(cfg, payload);
    if (!result.ok && result.reason === "user_not_resolved") {
      console.warn(
        "[creem webhook] could not resolve user",
        payload.eventType,
        payload.id,
      );
      return NextResponse.json({
        received: true,
        applied: false,
        reason: result.reason,
      });
    }
    return NextResponse.json({
      received: true,
      applied: !result.skipped,
      skipped: result.skipped ?? false,
      reason: result.reason ?? null,
      userId: result.userId ?? null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook failed";
    console.error("[creem webhook]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
