import { JobCard } from "@/components/JobCard";
import { getJobData } from "@/lib/jobs";

export const revalidate = 21600;

export default async function RecommendationsPage() {
  const data = await getJobData();
  return (
    <>
      <h1 className="page-title">Recommended for you</h1>
      <p className="subtle">Ranked by deterministic skill fit, role intent, language, location, experience, and visa compatibility.</p>
      <div className="jobs-grid">{data.items.map((item) => <JobCard item={item} key={item.job.id} />)}</div>
    </>
  );
}
