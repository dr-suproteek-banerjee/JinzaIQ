import { ScoreBreakdown } from "@/components/ScoreBreakdown";
import { apiGet, type JobWithMatch, yen } from "@/lib/api";

export default async function JobDetail({ params }: { params: { id: string } }) {
  const item = await apiGet<JobWithMatch>(`/api/v1/jobs/${params.id}`);
  const { job, match } = item;
  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">{job.title}</h1>
          <div className="subtle">{job.company.name} · {job.location} · {job.remote_policy}</div>
        </div>
        <a className="button" href={job.application_url}>Apply</a>
      </div>
      <section className="grid two-col">
        <article className="card">
          <h2>Your match: {match.match_score}%</h2>
          <ScoreBreakdown match={match} />
          <h3>Strong matches</h3>
          <div className="pill-row">{match.matched_skills.map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
          <h3>Missing</h3>
          <div className="pill-row">{match.missing_skills.map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
          {match.risks.map((risk) => <p className="warning" key={risk}>{risk}</p>)}
        </article>
        <aside className="card">
          <h2>Role details</h2>
          <p>{yen(job.salary_min)}-{job.salary_max ? yen(job.salary_max) : "open"} · {job.experience_level}</p>
          <p>Japanese: {job.japanese_requirement}. English: professional communication expected.</p>
          <p>Visa: {job.visa_sponsorship}. Verify eligibility directly with the employer.</p>
          <h3>Responsibilities</h3>
          <ul>{job.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3>Benefits</h3>
          <ul>{job.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
        </aside>
      </section>
    </>
  );
}
