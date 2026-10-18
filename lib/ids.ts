export function newId(prefix = ""): string {
  const id = crypto.randomUUID().replace(/-/g, "");
  return prefix ? `${prefix}_${id}` : id;
}

export function otpCode(): string {
  const n = crypto.getRandomValues(new Uint32Array(1))[0]! % 1_000_000;
  return n.toString().padStart(6, "0");
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function plusMinutesIso(mins: number): string {
  return new Date(Date.now() + mins * 60_000).toISOString();
}

export function plusDaysIso(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60_000).toISOString();
}
