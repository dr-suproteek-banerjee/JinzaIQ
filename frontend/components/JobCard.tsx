import { BookmarkPlus, ExternalLink } from "lucide-react";
import Link from "next/link";
import type { JobWithMatch } from "@/lib/api";
import { yen } from "@/lib/api";

export function JobCard({ item }: { item: JobWithMatch }) {
  const { job, match } = item;
  return (
    <article className="card job-card">
      <div>
        <div className="subtle">{job.company.name} · {job.location} · {job.remote_policy}</div>
        <h2 style={{ margin: "6px 0" }}>
          <Link href={`/jobs/${job.id}`}>{job.title}</Link>
        </h2>
        <div className="subtle">
          {yen(job.salary_min)}-{job.salary_max ? yen(job.salary_max) : "open"} · Japanese {job.japanese_requirement} · {job.visa_sponsorship}
        </div>
        <div className="pill-row">
          {job.required_skills.slice(0, 5).map((skill) => <span className="pill" key={skill}>{skill}</span>)}
        </div>
        <p>{match.summary}</p>
        <div className="pill-row">
          <span className="pill">Freshness: {job.estimated_freshness}</span>
          <span className="pill">Confidence: {match.confidence}</span>
          <span className="pill">Missing: {match.missing_skills.slice(0, 2).join(", ") || "None"}</span>
        </div>
      </div>
      <div className="match">
        <strong>{match.match_score}%</strong>
        <span>Match</span>
        <div className="pill-row" style={{ justifyContent: "center" }}>
          <BookmarkPlus size={17} aria-label="Save job" />
          <ExternalLink size={17} aria-label="Open application" />
        </div>
      </div>
    </article>
  );
}
