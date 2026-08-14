import { JobCard } from "@/components/JobCard";
import { apiGet, type JobWithMatch } from "@/lib/api";

export default async function JobsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const params = new URLSearchParams();
  for (const key of ["keyword", "location", "japanese", "visa", "skill"]) {
    if (searchParams[key]) params.set(key, searchParams[key] as string);
  }
  const data = await apiGet<{ total: number; items: JobWithMatch[] }>(`/api/v1/jobs?${params}`);
  return (
    <>
      <div className="topbar">
        <div>
          <h1 className="page-title">Job Discovery</h1>
          <div className="subtle">{data.total} Japan technology roles with explainable AI matching.</div>
        </div>
      </div>
      <form className="toolbar">
        <input className="input" name="keyword" placeholder="Software Engineer, AWS, fintech" defaultValue={searchParams.keyword} />
        <select className="select" name="location" defaultValue={searchParams.location}>
          <option value="">Any location</option>
          {["Tokyo", "Osaka", "Kyoto", "Nagoya", "Fukuoka", "Remote"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="select" name="japanese" defaultValue={searchParams.japanese}>
          <option value="">Any Japanese level</option>
          {["None", "N3", "N2", "N1", "Native"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <select className="select" name="visa" defaultValue={searchParams.visa}>
          <option value="">Any visa signal</option>
          {["Likely sponsors", "Does not mention sponsorship", "Unknown", "Not eligible"].map((x) => <option key={x}>{x}</option>)}
        </select>
        <input className="input" name="skill" placeholder="Skill" defaultValue={searchParams.skill} />
        <button className="button">Search</button>
      </form>
      <div className="grid">
        {data.items.map((item) => <JobCard item={item} key={item.job.id} />)}
      </div>
    </>
  );
}
