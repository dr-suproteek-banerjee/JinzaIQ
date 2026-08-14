import { apiGet } from "@/lib/api";

type Gap = {
  target: string;
  readiness: number;
  current_skills: string[];
  missing_skills: { skill: string; importance: string; current_level: string; target_level: string; reason: string; estimated_difficulty: string }[];
  suggested_learning_order: string[];
  target_roles: string[];
};

export default async function CareerGapPage() {
  const gap = await apiGet<Gap>("/api/v1/career-gap");
  return (
    <>
      <h1 className="page-title">Your Japan Career Gap</h1>
      <section className="grid two-col" style={{ marginTop: 16 }}>
        <div className="card">
          <div className="subtle">Target: {gap.target}</div>
          <div className="metric">{gap.readiness}%</div>
          <h2>Suggested learning order</h2>
          <ol>{gap.suggested_learning_order.map((skill) => <li key={skill}>{skill}</li>)}</ol>
        </div>
        <div className="grid">
          {gap.missing_skills.map((item) => (
            <article className="card" key={item.skill}>
              <h2>{item.skill}</h2>
              <p>{item.reason}</p>
              <div className="pill-row">
                <span className="pill">{item.importance}</span>
                <span className="pill">{item.current_level}</span>
                <span className="pill">{item.target_level}</span>
                <span className="pill">{item.estimated_difficulty}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
