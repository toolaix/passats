export type ParsedUpload = {
  text: string;
  source: "pdf" | "docx" | "text";
};

const MAX_BYTES = 5 * 1024 * 1024;

export function assertUploadSize(bytes: number) {
  if (bytes > MAX_BYTES) {
    throw new Error("File too large (max 5MB).");
  }
}

export async function parsePdfBuffer(buf: Buffer): Promise<string> {
  // Avoid pdf-parse's debug-mode test file read by requiring the lib entry.
  const pdfParseModule = await import("pdf-parse/lib/pdf-parse.js").catch(
    async () => import("pdf-parse"),
  );
  const pdfParse =
    (pdfParseModule as { default?: (d: Buffer) => Promise<{ text: string }> })
      .default ??
    (pdfParseModule as unknown as (d: Buffer) => Promise<{ text: string }>);
  const result = await pdfParse(buf);
  return (result.text || "").trim();
}

export async function parseDocxBuffer(buf: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer: buf });
  return (result.value || "").trim();
}

export async function parseUpload(
  file: File | null,
  pasteText: string | null,
): Promise<ParsedUpload> {
  const pasted = (pasteText || "").trim();
  if (file && file.size > 0) {
    assertUploadSize(file.size);
    const name = (file.name || "").toLowerCase();
    const type = (file.type || "").toLowerCase();
    const ab = await file.arrayBuffer();
    const buf = Buffer.from(ab);

    if (name.endsWith(".pdf") || type === "application/pdf") {
      const text = await parsePdfBuffer(buf);
      if (!text) throw new Error("Could not extract text from PDF.");
      return { text, source: "pdf" };
    }
    if (
      name.endsWith(".docx") ||
      type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const text = await parseDocxBuffer(buf);
      if (!text) throw new Error("Could not extract text from DOCX.");
      return { text, source: "docx" };
    }
    throw new Error("Only PDF or DOCX uploads are supported.");
  }

  if (pasted.length >= 40) {
    return { text: pasted, source: "text" };
  }
  throw new Error(
    "Upload a PDF/DOCX or paste at least ~40 characters of resume text.",
  );
}
