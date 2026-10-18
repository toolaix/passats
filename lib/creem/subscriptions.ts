import { getDB } from "@/lib/db";
import { nowIso } from "@/lib/ids";
import type { BillingPlan, CreemConfig } from "@/lib/creem/config";
import { planFromProductId } from "@/lib/creem/config";

export type SubscriptionRow = {
  user_id: string;
  creem_customer_id: string | null;
  creem_subscription_id: string | null;
  plan: string | null;
  status: string | null;
  current_period_end: string | null;
  updated_at: string;
};

export async function getSubscription(
  userId: string,
): Promise<SubscriptionRow | null> {
  const db = await getDB();
  return db
    .prepare(`SELECT * FROM subscriptions WHERE user_id = ?`)
    .bind(userId)
    .first<SubscriptionRow>();
}

export async function upsertSubscription(opts: {
  userId: string;
  creemCustomerId?: string | null;
  creemSubscriptionId?: string | null;
  plan?: BillingPlan | string | null;
  status: string;
  currentPeriodEnd?: string | null;
}): Promise<void> {
  const db = await getDB();
  const updated = nowIso();
  await db
    .prepare(
      `INSERT INTO subscriptions (
         user_id, creem_customer_id, creem_subscription_id, plan, status, current_period_end, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         creem_customer_id = COALESCE(excluded.creem_customer_id, subscriptions.creem_customer_id),
         creem_subscription_id = COALESCE(excluded.creem_subscription_id, subscriptions.creem_subscription_id),
         plan = COALESCE(excluded.plan, subscriptions.plan),
         status = excluded.status,
         current_period_end = COALESCE(excluded.current_period_end, subscriptions.current_period_end),
         updated_at = excluded.updated_at`,
    )
    .bind(
      opts.userId,
      opts.creemCustomerId ?? null,
      opts.creemSubscriptionId ?? null,
      opts.plan ?? null,
      opts.status,
      opts.currentPeriodEnd ?? null,
      updated,
    )
    .run();
}

function asId(
  value: unknown,
): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object" && value !== null && "id" in value) {
    const id = (value as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function asEmail(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  const email = (value as { email?: unknown }).email;
  return typeof email === "string" ? email.trim().toLowerCase() : null;
}

async function resolveUserId(opts: {
  requestId?: string | null;
  metadataUserId?: string | null;
  customerEmail?: string | null;
  creemSubscriptionId?: string | null;
  creemCustomerId?: string | null;
}): Promise<string | null> {
  const db = await getDB();

  if (opts.requestId) {
    const byId = await db
      .prepare(`SELECT id FROM users WHERE id = ?`)
      .bind(opts.requestId)
      .first<{ id: string }>();
    if (byId) return byId.id;
  }

  if (opts.metadataUserId) {
    const byMeta = await db
      .prepare(`SELECT id FROM users WHERE id = ?`)
      .bind(opts.metadataUserId)
      .first<{ id: string }>();
    if (byMeta) return byMeta.id;
  }

  if (opts.creemSubscriptionId) {
    const bySub = await db
      .prepare(
        `SELECT user_id FROM subscriptions WHERE creem_subscription_id = ?`,
      )
      .bind(opts.creemSubscriptionId)
      .first<{ user_id: string }>();
    if (bySub) return bySub.user_id;
  }

  if (opts.creemCustomerId) {
    const byCust = await db
      .prepare(
        `SELECT user_id FROM subscriptions WHERE creem_customer_id = ?`,
      )
      .bind(opts.creemCustomerId)
      .first<{ user_id: string }>();
    if (byCust) return byCust.user_id;
  }

  if (opts.customerEmail) {
    const byEmail = await db
      .prepare(`SELECT id FROM users WHERE email = ?`)
      .bind(opts.customerEmail)
      .first<{ id: string }>();
    if (byEmail) return byEmail.id;
  }

  return null;
}

type LooseObj = Record<string, unknown>;

function periodEndFromSub(sub: LooseObj | null): string | null {
  if (!sub) return null;
  const end =
    sub.current_period_end_date ||
    sub.current_period_end ||
    sub.next_transaction_date;
  return typeof end === "string" ? end : null;
}

function statusFromEvent(
  eventType: string,
  objectStatus: string | null,
): string {
  if (eventType === "subscription.canceled") return "canceled";
  if (eventType === "subscription.expired") return "expired";
  if (eventType === "subscription.past_due") return "past_due";
  if (eventType === "subscription.unpaid") return "unpaid";
  if (eventType === "subscription.paused") return "paused";
  if (eventType === "subscription.scheduled_cancel") return "scheduled_cancel";
  if (eventType === "subscription.trialing") return "trialing";
  if (eventType === "subscription.paid" || eventType === "subscription.active") {
    return objectStatus === "trialing" ? "trialing" : "active";
  }
  if (eventType === "checkout.completed") {
    return objectStatus === "trialing" ? "trialing" : "active";
  }
  return objectStatus || "active";
}

/**
 * Apply a Creem webhook payload to D1 subscriptions.
 * Returns whether a row was updated (false if user could not be resolved).
 */
export async function applyCreemWebhookEvent(
  cfg: CreemConfig,
  payload: {
    id?: string;
    eventType?: string;
    object?: LooseObj;
  },
): Promise<{ ok: boolean; skipped?: boolean; reason?: string; userId?: string }> {
  const eventId = typeof payload.id === "string" ? payload.id : null;
  const eventType =
    typeof payload.eventType === "string" ? payload.eventType : "";
  const obj = (payload.object || {}) as LooseObj;

  const db = await getDB();
  if (eventId) {
    const seen = await db
      .prepare(`SELECT id FROM webhook_events WHERE id = ?`)
      .bind(eventId)
      .first<{ id: string }>();
    if (seen) {
      return { ok: true, skipped: true, reason: "duplicate" };
    }
  }

  const handled = new Set([
    "checkout.completed",
    "subscription.paid",
    "subscription.active",
    "subscription.trialing",
    "subscription.canceled",
    "subscription.expired",
    "subscription.past_due",
    "subscription.unpaid",
    "subscription.paused",
    "subscription.scheduled_cancel",
    "subscription.update",
  ]);

  if (!handled.has(eventType)) {
    if (eventId) {
      await db
        .prepare(
          `INSERT OR IGNORE INTO webhook_events (id, event_type, processed_at) VALUES (?, ?, ?)`,
        )
        .bind(eventId, eventType, nowIso())
        .run();
    }
    return { ok: true, skipped: true, reason: `ignored:${eventType}` };
  }

  let subscription: LooseObj | null = null;
  let customer: LooseObj | null = null;
  let product: LooseObj | null = null;
  let requestId: string | null = null;
  let metadata: LooseObj = {};

  if (eventType === "checkout.completed") {
    subscription =
      typeof obj.subscription === "object" && obj.subscription
        ? (obj.subscription as LooseObj)
        : null;
    customer =
      typeof obj.customer === "object" && obj.customer
        ? (obj.customer as LooseObj)
        : null;
    product =
      typeof obj.product === "object" && obj.product
        ? (obj.product as LooseObj)
        : null;
    requestId = typeof obj.request_id === "string" ? obj.request_id : null;
    metadata =
      typeof obj.metadata === "object" && obj.metadata
        ? (obj.metadata as LooseObj)
        : {};
    if (!metadata.user_id && subscription?.metadata) {
      metadata = {
        ...metadata,
        ...(subscription.metadata as LooseObj),
      };
    }
  } else {
    subscription = obj;
    customer =
      typeof obj.customer === "object" && obj.customer
        ? (obj.customer as LooseObj)
        : null;
    product =
      typeof obj.product === "object" && obj.product
        ? (obj.product as LooseObj)
        : null;
    metadata =
      typeof obj.metadata === "object" && obj.metadata
        ? (obj.metadata as LooseObj)
        : {};
  }

  const creemSubscriptionId = asId(subscription) || asId(obj.id);
  const creemCustomerId = asId(customer) || asId(subscription?.customer);
  const productId = asId(product) || asId(subscription?.product);
  const billingPeriod =
    product && typeof product.billing_period === "string"
      ? product.billing_period
      : null;
  const objectStatus =
    typeof subscription?.status === "string" ? subscription.status : null;
  const metaUserId =
    typeof metadata.user_id === "string"
      ? metadata.user_id
      : typeof metadata.userId === "string"
        ? metadata.userId
        : typeof metadata.referenceId === "string"
          ? metadata.referenceId
          : null;

  const userId = await resolveUserId({
    requestId,
    metadataUserId: metaUserId,
    customerEmail: asEmail(customer),
    creemSubscriptionId,
    creemCustomerId,
  });

  if (!userId) {
    return {
      ok: false,
      reason: "user_not_resolved",
    };
  }

  const plan = planFromProductId(cfg, productId, billingPeriod);
  const status = statusFromEvent(eventType, objectStatus);
  const currentPeriodEnd = periodEndFromSub(subscription);

  await upsertSubscription({
    userId,
    creemCustomerId,
    creemSubscriptionId,
    plan,
    status,
    currentPeriodEnd,
  });

  if (eventId) {
    await db
      .prepare(
        `INSERT OR IGNORE INTO webhook_events (id, event_type, processed_at) VALUES (?, ?, ?)`,
      )
      .bind(eventId, eventType, nowIso())
      .run();
  }

  return { ok: true, userId };
}
