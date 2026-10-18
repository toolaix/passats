/** Split JD / resume into normalized keyword tokens (length ≥ 3). */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, " ")
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 3);
}

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "our",
  "are",
  "is",
  "was",
  "were",
  "will",
  "have",
  "has",
  "had",
  "this",
  "that",
  "from",
  "into",
  "about",
  "over",
  "under",
  "than",
  "then",
  "them",
  "they",
  "their",
  "been",
  "being",
  "also",
  "such",
  "able",
  "work",
  "job",
  "role",
  "team",
  "company",
  "including",
  "include",
  "required",
  "requirements",
  "preferred",
  "experience",
  "years",
  "year",
  "using",
  "use",
  "used",
  "must",
  "should",
  "can",
  "may",
  "etc",
  "etc.",
  "via",
  "per",
  "any",
  "all",
  "not",
  "but",
  "or",
  "an",
  "a",
  "to",
  "of",
  "in",
  "on",
  "at",
  "by",
  "as",
  "we",
  "be",
]);

/** Extract distinctive JD keywords (freq ≥ 1, not stopwords, prefer multi-mention). */
export function extractJdKeywords(jd: string, limit = 40): string[] {
  const tokens = tokenize(jd).filter((t) => !STOP.has(t) && !/^\d+$/.test(t));
  const freq = new Map<string, number>();
  for (const t of tokens) freq.set(t, (freq.get(t) ?? 0) + 1);

  // Prefer multi-word tech-ish tokens already split; boost repeats
  const ranked = [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([k]) => k);

  // Also pull simple phrase candidates: "machine learning", "project management"
  const phrases = extractPhrases(jd);
  const merged: string[] = [];
  const seen = new Set<string>();
  for (const p of phrases) {
    if (!seen.has(p)) {
      seen.add(p);
      merged.push(p);
    }
  }
  for (const k of ranked) {
    if (!seen.has(k) && !merged.some((m) => m.includes(k) && m !== k)) {
      seen.add(k);
      merged.push(k);
    }
    if (merged.length >= limit) break;
  }
  return merged.slice(0, limit);
}

function extractPhrases(text: string): string[] {
  const lower = text.toLowerCase();
  const patterns = [
    /\b(?:machine learning|data science|project management|software engineering|customer success|product management|full[\s-]?stack|front[\s-]?end|back[\s-]?end|ci\/cd|rest api|graphql|cloud computing|agile scrum|unit testing|test automation)\b/g,
  ];
  const out: string[] = [];
  for (const re of patterns) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(lower))) out.push(m[0].replace(/\s+/g, " ").trim());
  }
  return [...new Set(out)];
}

export function matchKeywords(
  resumeText: string,
  keywords: string[],
): { matched: string[]; missing: string[] } {
  const hay = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];
  for (const kw of keywords) {
    if (hay.includes(kw.toLowerCase())) matched.push(kw);
    else missing.push(kw);
  }
  return { matched, missing };
}
