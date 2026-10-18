/**
 * Lean Cloudflare / D1 typings for Next + OpenNext.
 * Optional full runtime types: `npm run cf-typegen` → cloudflare-env.d.ts (gitignored).
 */

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown[]>(): Promise<T[]>;
}

interface D1Result<T = unknown> {
  success: boolean;
  meta: Record<string, unknown>;
  results?: T[];
}

interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

interface D1ExecResult {
  count: number;
  duration: number;
}

interface CloudflareEnv {
  DB: D1Database;
  ASSETS?: Fetcher;
  NEXTJS_ENV?: string;
  SESSION_SECRET?: string;
  RESEND_API_KEY?: string;
  EMAIL_FROM?: string;
  DEV_PREMIUM?: string;
  APP_BASE_URL?: string;
  CREEM_API_KEY?: string;
  CREEM_WEBHOOK_SECRET?: string;
  CREEM_API_BASE?: string;
  CREEM_PRICE_MONTHLY?: string;
  CREEM_PRICE_YEARLY?: string;
  CREEM_CHECKOUT_URL_MONTHLY?: string;
  CREEM_CHECKOUT_URL_YEARLY?: string;
  CREEM_SUCCESS_URL?: string;
  CREEM_CUSTOMER_PORTAL_URL?: string;
  NEXT_PUBLIC_CREEM_CHECKOUT_URL?: string;
}
