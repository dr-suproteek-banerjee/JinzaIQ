import { apiGet } from "@/lib/api";

type Company = { id: string; name: string; industry: string; location: string; company_size: string; work_style: string; tech_stack: string[]; visa_information: string; open_jobs: number };

export default async function CompaniesPage() {
  const companies = await apiGet<Company[]>("/api/v1/companies");
  return (
    <>
      <h1 className="page-title">Company Profiles</h1>
      <div className="grid" style={{ marginTop: 16 }}>
        {companies.map((company) => (
          <article className="card" key={company.id}>
            <h2>{company.name}</h2>
            <p className="subtle">{company.industry} · {company.location} · {company.company_size} · {company.work_style}</p>
            <div className="pill-row">{company.tech_stack.slice(0, 6).map((skill) => <span className="pill" key={skill}>{skill}</span>)}</div>
            <p>Visa signal: {company.visa_information}. Open jobs: {company.open_jobs}</p>
          </article>
        ))}
      </div>
    </>
  );
}
