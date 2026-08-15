import "server-only";
import mammoth from "mammoth";
import { extractSkills } from "./matching";

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const PDF_MIME = "application/pdf";
const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export function validateResume(file: File) {
  const extension = file.name.toLowerCase().split(".").pop();
  if (!file.size) throw new Error("The uploaded file is empty.");
  if (file.size > MAX_RESUME_BYTES) throw new Error("Resume must be 5 MB or smaller.");
  if (!(["pdf", "docx"].includes(extension ?? ""))) throw new Error("Upload a PDF or DOCX resume.");
  if (file.type && ![PDF_MIME, DOCX_MIME, "application/octet-stream"].includes(file.type)) throw new Error("The file type does not match a PDF or DOCX resume.");
}

export async function parseResume(file: File) {
  validateResume(file);
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text = "";
  if (file.name.toLowerCase().endsWith(".pdf")) {
    if (new TextDecoder().decode(bytes.slice(0, 5)) !== "%PDF-") throw new Error("This file does not contain a valid PDF header.");
    // Load the package's Node worker first: it provides the canvas globals
    // absent from serverless Node and an embedded worker that remains
    // available after Vercel bundles the route.
    const { getData } = await import("pdf-parse/worker");
    const { PDFParse } = await import("pdf-parse");
    PDFParse.setWorker(getData());
    const parser = new PDFParse({ data: bytes });
    try { text = (await parser.getText()).text; } finally { await parser.destroy(); }
  } else {
    if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) throw new Error("This file does not contain a valid DOCX archive.");
    text = (await mammoth.extractRawText({ buffer: Buffer.from(bytes) })).value;
  }
  text = text.replace(/\0/g, "").replace(/\s+/g, " ").trim().slice(0, 100_000);
  if (text.length < 40) throw new Error("We could not find enough readable text in this resume. Try exporting it again as a text-based PDF or DOCX.");
  return { text, skills: extractSkills(text), wordCount: text.split(/\s+/).length };
}
