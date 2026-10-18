# PassATS

Free **ATS resume checker** — upload PDF/DOCX (or paste text), get a 0–100 score, actionable issues, and job-description keyword gaps.

## Quick start

```bash
cd /workspace/passats
npm install
npm run test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → Free scan section.

Fixture sample score (with JD): **87**.

## W1 scope

- Rule-based scoring (no LLM)
- Cookie rate limit: 3 scans/day
- No auth / Creem / R2
- Plain `next build` (Cloudflare OpenNext follow-up in W2+)

See `docs/zh/mvp-spec.md`, `docs/zh/VERDICT.md`, `docs/zh/W1-notes.md`.

## Billing / auth (W2–W3)

See `docs/zh/BILLING.md`. Stack: email OTP + D1 + Creem ($12/mo · $79/yr placeholders).

```bash
npm run db:migrate:local
cp .dev.vars.example .dev.vars
npm run dev
```
