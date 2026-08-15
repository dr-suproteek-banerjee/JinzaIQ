"use client";

import { FileCheck2, FileText, LoaderCircle, ShieldCheck, Sparkles, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { JobWithMatch } from "@/lib/api";
import { PROFILE_KEY } from "./ProfileEditor";
import { JobCard } from "./JobCard";

type Analysis = { filename: string; wordCount: number; extractedSkills: string[]; matches: JobWithMatch[]; privacy: string };

export function ResumeLab() {
  const [file, setFile] = useState<File | null>(null); const [analysis, setAnalysis] = useState<Analysis | null>(null); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function analyze() {
    if (!file) return;
    setLoading(true); setError(""); setAnalysis(null);
    const data = new FormData(); data.append("resume", file); const stored = window.localStorage.getItem(PROFILE_KEY); if (stored) data.append("profile", stored);
    try {
      const response = await fetch("/api/resume/analyze", { method: "POST", body: data }); const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Analysis failed."); setAnalysis(body);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Analysis failed."); } finally { setLoading(false); }
  }
  return (
    <>
      <section className="resume-hero">
        <div><span className="kicker light">Private resume intelligence</span><h1>Turn your resume into a smarter job shortlist.</h1><p>Upload a text-based PDF or DOCX. JinzaIQ reads the content, identifies technical skills, and reranks live and curated jobs with an explainable score.</p><div className="trust-row"><span><ShieldCheck size={16} /> Processed in memory</span><span><FileText size={16} /> PDF + DOCX</span><span><Sparkles size={16} /> Explainable matching</span></div></div>
        <div className="upload-panel">
          <label className={`drop-zone ${file ? "has-file" : ""}`}><input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setAnalysis(null); setError(""); }} /><span className="upload-icon">{file ? <FileCheck2 /> : <UploadCloud />}</span><strong>{file ? file.name : "Choose your resume"}</strong><span>{file ? `${(file.size / 1024 / 1024).toFixed(2)} MB · ready to analyze` : "Drop it here or browse · maximum 5 MB"}</span></label>
          <button className="button wide" disabled={!file || loading} onClick={analyze}>{loading ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}{loading ? "Reading your resume…" : "Analyze & match jobs"}</button>
          <p className="microcopy">Your file is not saved. Profile preferences come from <Link href="/profile">your locally stored profile</Link>.</p>
          {error ? <div className="error-box" role="alert">{error}</div> : null}
        </div>
      </section>
      {analysis ? <section className="analysis-section"><div className="analysis-summary"><div><span className="kicker">Analysis complete</span><h2>{analysis.filename}</h2><p>{analysis.wordCount.toLocaleString()} words read · {analysis.extractedSkills.length} recognized skills</p></div><div className="pill-row">{analysis.extractedSkills.length ? analysis.extractedSkills.map((skill) => <span className="pill accent" key={skill}>{skill}</span>) : <span className="subtle">No skills from our current taxonomy were recognized.</span>}</div></div><div className="section-intro"><div><span className="kicker">Your ranked shortlist</span><h2>Best matches from the current job feed</h2></div><span className="result-count">{analysis.matches.length} results</span></div><div className="jobs-grid">{analysis.matches.map((item) => <JobCard item={item} key={item.job.id} />)}</div></section> : null}
    </>
  );
}
