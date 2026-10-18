import type { AtsIssue, AtsScoreResult, ScoreBreakdown, ScoreInput } from "./types";
import { extractJdKeywords, matchKeywords } from "./keywords";

const ACTION_VERBS = [
  "led",
  "managed",
  "built",
  "designed",
  "developed",
  "implemented",
  "improved",
  "increased",
  "reduced",
  "created",
  "launched",
  "owned",
  "delivered",
  "optimized",
  "automated",
  "analyzed",
  "collaborated",
  "coordinated",
  "negotiated",
  "spearheaded",
  "drove",
  "achieved",
  "established",
  "scaled",
  "migrated",
  "architected",
  "shipped",
];

const SECTION_PATTERNS: { id: string; re: RegExp }[] = [
  { id: "experience", re: /\b(experience|work history|employment|professional experience)\b/i },
  { id: "education", re: /\b(education|academic|university|bachelor|master|phd|degree)\b/i },
  { id: "skills", re: /\b(skills|technical skills|core competencies|technologies)\b/i },
  { id: "summary", re: /\b(summary|profile|objective|about me)\b/i },
];

const DISCLAIMER =
  "PassATS scores are rule-based estimates to help you improve parseability and keyword coverage. They are not an official ATS (Workday, Taleo, Greenhouse, etc.) result.";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function hasEmail(text: string) {
  return /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(text);
}

function hasPhone(text: string) {
  return /(\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/.test(text);
}

function countActionVerbs(text: string) {
  const lower = text.toLowerCase();
  let n = 0;
  for (const v of ACTION_VERBS) {
    const re = new RegExp(`\\b${v}\\b`, "g");
    const m = lower.match(re);
    if (m) n += m.length;
  }
  return n;
}

function countQuantifiers(text: string) {
  // $, %, x, numbers with units
  const money = text.match(/\$\s?\d[\d,]*(?:\.\d+)?/g)?.length ?? 0;
  const pct = text.match(/\d+(?:\.\d+)?%/g)?.length ?? 0;
  const nums = text.match(/\b\d+(?:\.\d+)?[kx]?\+?\b/gi)?.length ?? 0;
  return money + pct + Math.min(nums, 12);
}

function detectRisks(text: string): AtsIssue[] {
  const issues: AtsIssue[] = [];
  if (/│|┃|┌|└|┬|┴|┼|╔|╚|║/.test(text) || /\t{2,}/.test(text)) {
    issues.push({
      id: "risk-table",
      severity: "high",
      title: "Possible table or multi-column layout",
      detail:
        "Many ATS parsers flatten tables poorly and scramble reading order.",
      howToFix:
        "Use a single-column layout with clear section headings instead of tables or text boxes.",
    });
  }
  if (/\[image\]|\[graphic\]|<img|base64/i.test(text) || text.trim().length < 80) {
    issues.push({
      id: "risk-image",
      severity: "high",
      title: "Little extractable text",
      detail:
        "If your resume is image-heavy or scanned, ATS may read almost nothing.",
      howToFix: "Export a text-based PDF or DOCX (not a flat scan of a design).",
    });
  }
  if (/•{3,}|·{3,}/.test(text) && text.split("\n").length < 8) {
    issues.push({
      id: "risk-dense",
      severity: "medium",
      title: "Dense or unusual bullet formatting",
      detail: "Exotic bullets can confuse older parsers.",
      howToFix: "Use standard bullets or plain hyphens, one achievement per line.",
    });
  }
  // Headers/footers often put contact only in PDF header — hard to detect; check contact at top
  const first800 = text.slice(0, 800);
  if (!hasEmail(first800) && hasEmail(text)) {
    issues.push({
      id: "risk-contact-footer",
      severity: "medium",
      title: "Contact info may be outside the body",
      detail:
        "Email appears late in the extract — headers/footers are often ignored by ATS.",
      howToFix: "Put name, email, and phone in the first few lines of the body.",
    });
  }
  return issues;
}

/**
 * Pure rule-based ATS-oriented score. Deterministic for the same inputs.
 */
export function scoreResume(input: ScoreInput): AtsScoreResult {
  const resumeText = (input.resumeText || "").replace(/\r\n/g, "\n").trim();
  const jd = (input.jobDescription || "").trim();
  const hasJobDescription = jd.length >= 40;
  const issues: AtsIssue[] = [];
  const wordCount = resumeText ? resumeText.split(/\s+/).filter(Boolean).length : 0;

  if (wordCount < 40) {
    issues.push({
      id: "too-short",
      severity: "high",
      title: "Resume text is too short",
      detail: `Only ~${wordCount} words were extracted.`,
      howToFix: "Upload a text PDF/DOCX or paste the full resume text.",
    });
  }

  // --- Sections (max 25) ---
  const detectedSections: string[] = [];
  for (const s of SECTION_PATTERNS) {
    if (s.re.test(resumeText)) detectedSections.push(s.id);
  }
  let sectionsScore = (detectedSections.length / SECTION_PATTERNS.length) * 25;
  if (!detectedSections.includes("experience")) {
    issues.push({
      id: "missing-experience",
      severity: "high",
      title: "No clear Experience section",
      detail: "ATS and recruiters look for a labeled work history block.",
      howToFix: "Add a heading like “Experience” or “Work History”.",
    });
  }
  if (!detectedSections.includes("skills")) {
    issues.push({
      id: "missing-skills",
      severity: "high",
      title: "No Skills section detected",
      detail: "Keyword matching often fails when skills are buried in prose.",
      howToFix: "Add a “Skills” or “Technical Skills” section with plain text.",
    });
  }
  if (!detectedSections.includes("education")) {
    issues.push({
      id: "missing-education",
      severity: "medium",
      title: "No Education section detected",
      detail: "Many ATS profiles expect an education block.",
      howToFix: "Add an “Education” heading with school and degree.",
    });
  }

  // --- Contact (max 15) ---
  const emailOk = hasEmail(resumeText);
  const phoneOk = hasPhone(resumeText);
  let contactScore = 0;
  if (emailOk) contactScore += 9;
  else {
    issues.push({
      id: "missing-email",
      severity: "high",
      title: "No email address found",
      detail: "Contact fields are required for ATS candidate records.",
      howToFix: "Add a plain-text email near the top (not only in a header image).",
    });
  }
  if (phoneOk) contactScore += 6;
  else {
    issues.push({
      id: "missing-phone",
      severity: "medium",
      title: "No phone number found",
      detail: "Phone helps recruiters and some ATS forms.",
      howToFix: "Add a phone number in a common format, e.g. (555) 123-4567.",
    });
  }

  // --- Verbs + quant (max 20, or 30 without JD) ---
  const verbs = countActionVerbs(resumeText);
  const quants = countQuantifiers(resumeText);
  const verbCap = hasJobDescription ? 12 : 18;
  const quantCap = hasJobDescription ? 8 : 12;
  let verbsQuantScore =
    clamp((verbs / 8) * verbCap, 0, verbCap) +
    clamp((quants / 6) * quantCap, 0, quantCap);
  if (verbs < 3) {
    issues.push({
      id: "weak-verbs",
      severity: "medium",
      title: "Few action verbs",
      detail: `Found ~${verbs} strong action verbs.`,
      howToFix:
        "Start bullets with verbs like led, built, shipped, reduced, increased.",
    });
  }
  if (quants < 2) {
    issues.push({
      id: "weak-metrics",
      severity: "medium",
      title: "Few measurable results",
      detail: "Quantified impact improves both humans and keyword-rich phrasing.",
      howToFix: "Add numbers: %, $, time saved, users, revenue, tickets closed.",
    });
  }

  // --- Keywords (max 25 with JD, else 0 and weight redistributed into verbs already) ---
  let matchedKeywords: string[] = [];
  let missingKeywords: string[] = [];
  let keywordsScore = 0;
  if (hasJobDescription) {
    const kws = extractJdKeywords(jd, 35);
    const { matched, missing } = matchKeywords(resumeText, kws);
    matchedKeywords = matched;
    missingKeywords = missing;
    const ratio = kws.length ? matched.length / kws.length : 0;
    keywordsScore = clamp(ratio * 25, 0, 25);
    if (missing.length > 0) {
      const top = missing.slice(0, 8).join(", ");
      issues.push({
        id: "missing-keywords",
        severity: missing.length > 10 ? "high" : "medium",
        title: `${missing.length} job keywords missing`,
        detail: `Top gaps: ${top}${missing.length > 8 ? "…" : ""}`,
        howToFix:
          "Mirror the employer’s wording in Skills and Experience where truthful.",
      });
    }
  } else {
    // Without JD, give a small “baseline keyword hygiene” from skills density
    const skillsHint = /\b(skills|python|javascript|java|sql|react|aws|excel)\b/i.test(
      resumeText,
    );
    keywordsScore = skillsHint ? 12 : 6;
    issues.push({
      id: "no-jd",
      severity: "low",
      title: "No job description provided",
      detail: "Keyword match score is limited without a target JD.",
      howToFix: "Paste the job description to unlock missing-keyword analysis.",
    });
  }

  // --- Risks (start 15, subtract) ---
  const riskIssues = detectRisks(resumeText);
  issues.push(...riskIssues);
  let risksScore = 15;
  for (const r of riskIssues) {
    if (r.severity === "high") risksScore -= 6;
    else if (r.severity === "medium") risksScore -= 3;
    else risksScore -= 1;
  }
  risksScore = clamp(risksScore, 0, 15);

  const breakdown: ScoreBreakdown = {
    sections: Math.round(sectionsScore),
    contact: Math.round(contactScore),
    verbsQuant: Math.round(verbsQuantScore),
    keywords: Math.round(keywordsScore),
    risks: Math.round(risksScore),
  };

  let raw =
    breakdown.sections +
    breakdown.contact +
    breakdown.verbsQuant +
    breakdown.keywords +
    breakdown.risks;

  // Without JD, leave headroom so adding a JD can still raise the score.
  if (!hasJobDescription) {
    raw = clamp(Math.round(raw * 0.88), 0, 88);
  } else {
    raw = clamp(raw, 0, 100);
  }

  // Severity sort: high first
  const order = { high: 0, medium: 1, low: 2 };
  issues.sort((a, b) => order[a.severity] - order[b.severity]);

  return {
    score: raw,
    breakdown,
    issues,
    matchedKeywords,
    missingKeywords,
    hasJobDescription,
    wordCount,
    detectedSections,
    disclaimer: DISCLAIMER,
  };
}

export { DISCLAIMER };
