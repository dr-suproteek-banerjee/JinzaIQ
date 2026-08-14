import { apiGet, type JobWithMatch } from "@/lib/api";
import { JobCard } from "@/components/JobCard";
import Link from "next/link";

export default async function Dashboard() {
  const recommendations = await apiGet<JobWithMatch[]>("/api/v1/recommendations");
  const strong = recommendations.filter((item) => item.match.match_score >= 80).length;
  const average = Math.round(recommendations.reduce((sum, item) => sum + item.match.match_score, 0) / recommendations.length);
  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Good morning, Suproteek</h1>
          <div className="subtle">Your Japan tech career command center is ready.</div>
        </div>
        <Link className="button" href="/jobs">Explore jobs</Link>
      </div>
      <section className="grid stats">
        <div className="card"><div className="subtle">Japan Job Readiness</div><div className="metric">{average}%</div></div>
        <div className="card"><div className="subtle">Jobs matching your profile</div><div className="metric">120</div></div>
        <div className="card"><div className="subtle">Strong matches</div><div className="metric">{strong}</div></div>
        <div className="card"><div className="subtle">Applications</div><div className="metric">8</div></div>
      </section>
      <section className="grid two-col" style={{ marginTop: 16 }}>
        <div className="grid">
          {recommendations.slice(0, 4).map((item) => <JobCard item={item} key={item.job.id} />)}
        </div>
        <aside className="card">
          <h2>Top skills to improve</h2>
          <div className="pill-row">
            {["Spring Boot", "Kubernetes", "Japanese N2", "Kafka", "AWS ECS"].map((skill) => <span className="pill" key={skill}>{skill}</span>)}
          </div>
          <p className="subtle">Visa sponsorship indicators are inferred from listing language and must be verified directly with employers.</p>
        </aside>
      </section>
    </>
  );
}
