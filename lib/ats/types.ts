export type IssueSeverity = "high" | "medium" | "low";

export type AtsIssue = {
  id: string;
  severity: IssueSeverity;
  title: string;
  detail: string;
  howToFix: string;
};

export type ScoreBreakdown = {
  sections: number;
  contact: number;
  verbsQuant: number;
  keywords: number;
  risks: number;
};

export type AtsScoreResult = {
  score: number;
  breakdown: ScoreBreakdown;
  issues: AtsIssue[];
  matchedKeywords: string[];
  missingKeywords: string[];
  hasJobDescription: boolean;
  wordCount: number;
  detectedSections: string[];
  disclaimer: string;
};

export type ScoreInput = {
  resumeText: string;
  jobDescription?: string;
};
