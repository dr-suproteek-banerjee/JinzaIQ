import { JobCard } from "@/components/JobCard";
import { apiGet, type JobWithMatch } from "@/lib/api";

export default async function RecommendationsPage() {
  const data = await apiGet<JobWithMatch[]>("/api/v1/recommendations");
  return (
    <>
      <h1 className="page-title">Recommended for you</h1>
      <p className="subtle">Ranked by deterministic fit, language and visa compatibility, and mock semantic similarity.</p>
      <div className="grid">{data.map((item) => <JobCard item={item} key={item.job.id} />)}</div>
    </>
  );
}
