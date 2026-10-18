import { getCloudflareContext } from "@opennextjs/cloudflare";

/** D1 binding. Throws a clear error if local migrations / wrangler proxy are missing. */
export async function getDB(): Promise<D1Database> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    if (!env?.DB) {
      throw new Error(
        "D1 binding DB is missing. Run: npm run db:migrate:local",
      );
    }
    return env.DB;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Cannot reach Cloudflare D1 (${msg}). Use \`npm run dev\` after \`npm run db:migrate:local\` (OpenNext CF proxy). Scan API still works without D1.`,
    );
  }
}

export async function getEnv(): Promise<CloudflareEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env ?? null;
  } catch {
    return null;
  }
}
