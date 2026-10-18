import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const resume = readFileSync(join(__dirname, "fixtures/sample-resume.txt"), "utf8");
const jd = readFileSync(join(__dirname, "fixtures/sample-jd.txt"), "utf8");

function emit(name, src) {
  const { outputText } = ts.transpileModule(src, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: name,
  });
  return outputText
    .replace(/from ["']\.\/keywords["']/g, 'from "./keywords.js"')
    .replace(/from ["']\.\/types["']/g, 'from "./types.js"');
}

const outDir = join(__dirname, ".test-out");
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "types.js"), "export {};\n");
writeFileSync(
  join(outDir, "keywords.js"),
  emit("keywords.ts", readFileSync(join(__dirname, "keywords.ts"), "utf8")),
);
writeFileSync(
  join(outDir, "score.js"),
  emit("score.ts", readFileSync(join(__dirname, "score.ts"), "utf8")),
);

const { scoreResume } = await import(pathToFileURL(join(outDir, "score.js")).href);

const withJd = scoreResume({ resumeText: resume, jobDescription: jd });
const noJd = scoreResume({ resumeText: resume });
const empty = scoreResume({ resumeText: "" });

assert.ok(withJd.score >= 70 && withJd.score <= 100, `expected strong score, got ${withJd.score}`);
assert.ok(withJd.hasJobDescription);
assert.ok(withJd.matchedKeywords.length >= 5, "should match several JD keywords");
assert.ok(
  withJd.missingKeywords.some((k) => k.includes("kubernetes")),
  `expected kubernetes missing, got ${withJd.missingKeywords.join(",")}`,
);
assert.ok(withJd.detectedSections.includes("experience"));
assert.ok(withJd.detectedSections.includes("skills"));
assert.ok(withJd.issues.every((i) => i.title && i.howToFix));

assert.ok(noJd.score >= 55, `no-JD score too low: ${noJd.score}`);
assert.equal(noJd.hasJobDescription, false);
assert.ok(noJd.issues.some((i) => i.id === "no-jd"));

assert.ok(empty.score < 40);
assert.ok(empty.issues.some((i) => i.id === "too-short"));

console.log("score.test.mjs OK");
console.log(
  "  fixture with JD:",
  withJd.score,
  "matched",
  withJd.matchedKeywords.length,
  "missing",
  withJd.missingKeywords.length,
);
console.log("  fixture no JD:", noJd.score);
console.log("  empty:", empty.score);

rmSync(outDir, { recursive: true, force: true });
