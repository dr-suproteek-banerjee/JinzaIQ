import "server-only";
import type { JobWithMatch } from "./api";
import { withMatches, type CandidateProfile } from "./matching";

type Job = JobWithMatch["job"];
type ProviderResult = { jobs: Job[]; provider: string; ok: boolean };

const TAG_SKILLS = ["Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Java", "Go", "Ruby", "PHP", "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "SQL", "PostgreSQL", "MongoDB", "Machine Learning", "LLM", "Git"];

const stripHtml = (value = "") => value.replace(/<[^>]*>/g, " ").replace(/&nbsp;|&amp;|&#39;|&quot;/g, " ").replace(/\s+/g, " ").trim();
const skillsFrom = (value: string, tags: string[] = []) => {
  const all = `${value} ${tags.join(" ")}`.toLowerCase();
  return TAG_SKILLS.filter((skill) => all.includes(skill.toLowerCase())).slice(0, 8);
};
const compact = (value: string) => value.slice(0, 520);
const idFor = (source: string, value: string | number) => `${source}-${String(value).replace(/[^a-zA-Z0-9-]/g, "-")}`;

export const curatedJobs: Job[] = [
  ["jp-platform-engineer", "Platform Engineer", "Mirai Commerce", "Tokyo", "Hybrid", ["AWS", "Kubernetes", "Terraform", "Go", "PostgreSQL"], ["Go", "Python"], "N3", "Likely sponsors", 7000000, 11000000],
  ["jp-fullstack-engineer", "Full-stack Product Engineer", "Aozora Labs", "Tokyo", "Remote-friendly", ["TypeScript", "React", "Next.js", "Node.js", "PostgreSQL"], ["AWS", "GraphQL"], "None", "Likely sponsors", 6000000, 9500000],
  ["jp-backend-engineer", "Backend Engineer — AI Platform", "Sakura Intelligence", "Tokyo", "Hybrid", ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"], ["LLM", "Kubernetes"], "None", "Likely sponsors", 6500000, 10500000],
  ["jp-data-engineer", "Data Engineer", "Kumo Analytics", "Osaka", "Hybrid", ["Python", "SQL", "AWS", "Spark", "Docker"], ["Terraform", "Snowflake"], "N3", "Likely sponsors", 5800000, 9200000],
  ["jp-mobile-engineer", "Mobile Engineer — iOS", "Hikari Mobility", "Tokyo", "On-site", ["Swift", "Git", "AWS"], ["Kotlin", "React"], "N2", "Does not mention sponsorship", 6000000, 9000000],
  ["jp-frontend-engineer", "Senior Frontend Engineer", "Nami Fintech", "Fukuoka", "Remote-friendly", ["TypeScript", "React", "Next.js", "Git"], ["Node.js", "AWS"], "N3", "Likely sponsors", 7000000, 11500000],
  ["jp-ml-engineer", "Machine Learning Engineer", "Kitsune Robotics", "Kyoto", "Hybrid", ["Python", "Machine Learning", "PyTorch", "Docker", "AWS"], ["C++", "Kubernetes"], "N3", "Likely sponsors", 6800000, 10800000],
  ["jp-cloud-engineer", "Cloud Reliability Engineer", "Seto Systems", "Nagoya", "Hybrid", ["AWS", "Terraform", "Kubernetes", "Python", "Linux"], ["Go", "Azure"], "N2", "Likely sponsors", 6200000, 9800000]
].map(([id, title, company, location, remote, required, preferred, japanese, visa, min, max]) => ({
  id: id as string, title: title as string, company: { id: `${id}-company`, name: company as string, industry: "Technology", location: location as string, tech_stack: required as string[], open_jobs: 1 },
  location: location as string, remote_policy: remote as string, salary_min: min as number, salary_max: max as number, japanese_requirement: japanese as string, visa_sponsorship: visa as string,
  experience_level: (title as string).includes("Senior") ? "Senior" : "Mid-level", required_skills: required as string[], preferred_skills: preferred as string[],
  responsibilities: ["Ship customer-facing software with a cross-functional product team", "Own quality, reliability, and continuous improvement"], benefits: ["Flexible working", "Learning budget", "Relocation discussion"],
  posting_date: "2026-08-15", estimated_freshness: "Curated showcase", application_url: "/resume", source_name: "JinzaIQ Curated", source_type: "curated", source_url: "/jobs", description: `A curated Japan-market ${title} role for demonstrating explainable matching. Employer details are illustrative.`
}));

async function fromArbeitnow(): Promise<ProviderResult> {
  try {
    const response = await fetch("https://www.arbeitnow.com/api/job-board-api", { next: { revalidate: 21600 }, signal: AbortSignal.timeout(6500), headers: { Accept: "application/json", "User-Agent": "JinzaIQ/1.0" } });
    if (!response.ok) throw new Error(String(response.status));
    const body = await response.json() as { data?: Array<Record<string, unknown>> };
    const jobs = (body.data ?? []).slice(0, 18).map((raw): Job => {
      const description = stripHtml(String(raw.description ?? "")); const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : []; const required = skillsFrom(description, tags);
      return { id: idFor("arbeitnow", String(raw.slug ?? raw.title)), title: String(raw.title ?? "Technology role"), company: { id: idFor("company", String(raw.company_name)), name: String(raw.company_name ?? "Hiring company"), industry: "Technology", location: String(raw.location ?? "Europe"), tech_stack: required, open_jobs: 1 }, location: String(raw.location ?? "Europe"), remote_policy: raw.remote ? "Remote" : "Location-based", salary_min: null, salary_max: null, japanese_requirement: "None", visa_sponsorship: raw.visa_sponsorship ? "Likely sponsors" : "Unknown", experience_level: "Not specified", required_skills: required.length ? required : tags.slice(0, 6), preferred_skills: [], responsibilities: [compact(description) || "See the original listing for responsibilities."], benefits: [], posting_date: String(raw.created_at ?? ""), estimated_freshness: "Live feed", application_url: String(raw.url ?? "https://www.arbeitnow.com"), source_name: "Arbeitnow", source_type: "live", source_url: "https://www.arbeitnow.com/blog/job-board-api", description: compact(description) };
    });
    return { jobs, provider: "Arbeitnow", ok: true };
  } catch { return { jobs: [], provider: "Arbeitnow", ok: false }; }
}

async function fromRemotive(): Promise<ProviderResult> {
  try {
    const response = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=18", { next: { revalidate: 21600 }, signal: AbortSignal.timeout(6500), headers: { Accept: "application/json", "User-Agent": "JinzaIQ/1.0" } });
    if (!response.ok) throw new Error(String(response.status));
    const body = await response.json() as { jobs?: Array<Record<string, unknown>> };
    const jobs = (body.jobs ?? []).slice(0, 18).map((raw): Job => {
      const description = stripHtml(String(raw.description ?? "")); const tags = Array.isArray(raw.tags) ? raw.tags.map(String) : []; const required = skillsFrom(description, tags);
      return { id: idFor("remotive", String(raw.id)), title: String(raw.title ?? "Remote technology role"), company: { id: idFor("company", String(raw.company_name)), name: String(raw.company_name ?? "Hiring company"), industry: "Technology", location: String(raw.candidate_required_location ?? "Remote"), tech_stack: required, open_jobs: 1 }, location: String(raw.candidate_required_location ?? "Remote"), remote_policy: "Remote", salary_min: null, salary_max: null, japanese_requirement: "None", visa_sponsorship: "Unknown", experience_level: "Not specified", required_skills: required.length ? required : tags.slice(0, 6), preferred_skills: [], responsibilities: [compact(description) || "See the original listing for responsibilities."], benefits: [], posting_date: String(raw.publication_date ?? ""), estimated_freshness: "Live feed · delayed", application_url: String(raw.url ?? "https://remotive.com/remote-jobs"), source_name: "Remotive", source_type: "live", source_url: "https://remotive.com/remote-jobs/api", description: compact(description) };
    });
    return { jobs, provider: "Remotive", ok: true };
  } catch { return { jobs: [], provider: "Remotive", ok: false }; }
}

export async function getJobData(profile?: CandidateProfile) {
  const providers = await Promise.all([fromArbeitnow(), fromRemotive()]);
  const liveJobs = providers.flatMap((item) => item.jobs);
  return { items: withMatches([...curatedJobs, ...liveJobs], profile), sources: providers.map(({ provider, ok, jobs }) => ({ name: provider, ok, count: jobs.length })), liveCount: liveJobs.length, curatedCount: curatedJobs.length };
}

export function filterJobs(items: JobWithMatch[], params: URLSearchParams) {
  const keyword = (params.get("keyword") ?? "").toLowerCase(); const location = (params.get("location") ?? "").toLowerCase(); const japanese = params.get("japanese") ?? ""; const visa = (params.get("visa") ?? "").toLowerCase(); const skill = (params.get("skill") ?? "").toLowerCase();
  return items.filter(({ job }) => (!keyword || `${job.title} ${job.company.name} ${job.description}`.toLowerCase().includes(keyword)) && (!location || `${job.location} ${job.remote_policy}`.toLowerCase().includes(location)) && (!japanese || job.japanese_requirement === japanese) && (!visa || job.visa_sponsorship.toLowerCase().includes(visa)) && (!skill || [...job.required_skills, ...job.preferred_skills].some((item) => item.toLowerCase().includes(skill))));
}
