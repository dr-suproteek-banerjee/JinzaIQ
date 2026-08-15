import type { JobWithMatch } from "./api";

const job: JobWithMatch["job"] = {
  id: "vercel-demo-backend-engineer",
  title: "Backend Engineer (AI SaaS)",
  company: {
    id: "vercel-demo-company",
    name: "Sakura AI Systems",
    industry: "AI SaaS",
    location: "Tokyo",
    tech_stack: ["Python", "FastAPI", "PostgreSQL", "AWS", "React"],
    open_jobs: 4
  },
  location: "Tokyo",
  remote_policy: "Hybrid",
  salary_min: 5500000,
  salary_max: 9000000,
  japanese_requirement: "None",
  visa_sponsorship: "Likely sponsors",
  experience_level: "Entry-level",
  required_skills: ["Python", "FastAPI", "PostgreSQL", "AWS", "Docker"],
  preferred_skills: ["Kubernetes", "LLM", "Terraform"],
  responsibilities: [
    "Build production APIs for AI-assisted recruiting workflows",
    "Improve observability and deployment reliability",
    "Collaborate with Japan-based product and engineering teams"
  ],
  benefits: ["Hybrid work", "Learning budget", "Relocation discussion"],
  posting_date: "2026-08-14",
  estimated_freshness: "Fresh",
  application_url: "https://example.com/jobs/vercel-demo"
  ,source_name: "JinzaIQ Curated"
  ,source_type: "curated"
  ,source_url: "https://jinza-iq.vercel.app/jobs"
  ,description: "Build reliable APIs and AI-assisted recruiting workflows with a product-focused engineering team in Tokyo."
};

const match: JobWithMatch["match"] = {
  match_score: 87,
  skill_match_score: 92,
  experience_match_score: 80,
  language_match_score: 100,
  location_match_score: 100,
  visa_score: 70,
  salary_score: 85,
  semantic_score: 78,
  matched_skills: ["Python", "FastAPI", "PostgreSQL", "AWS"],
  missing_skills: ["Kubernetes", "Terraform"],
  nice_to_have_skills: ["LLM"],
  risks: ["Visa sponsorship appears possible from listing language, but must be verified directly with the employer."],
  recommendations: ["Kubernetes", "Terraform", "Japanese N2"],
  summary: "Strong backend fit with clear infrastructure growth areas.",
  confidence: "demo"
};

export const fallbackJobs: JobWithMatch[] = [
  { job, match },
  {
    job: {
      ...job,
      id: "vercel-demo-cloud-engineer",
      title: "Cloud Platform Engineer",
      company: { ...job.company, id: "vercel-demo-company-2", name: "Kansai Cloud Works", location: "Osaka" },
      location: "Osaka",
      required_skills: ["AWS", "Terraform", "Docker", "Kubernetes", "Python"],
      japanese_requirement: "N3",
      salary_min: 6000000,
      salary_max: 10000000
    },
    match: {
      ...match,
      match_score: 74,
      language_match_score: 45,
      missing_skills: ["Terraform", "Kubernetes", "Japanese N3"],
      summary: "Good cloud fit, but language and orchestration requirements need attention."
    }
  }
];

export function fallbackForPath(path: string): unknown {
  if (path.startsWith("/api/v1/jobs/") && path !== "/api/v1/jobs") {
    return fallbackJobs[0];
  }
  if (path.startsWith("/api/v1/jobs")) {
    return { total: fallbackJobs.length, items: fallbackJobs };
  }
  if (path.startsWith("/api/v1/recommendations")) {
    return fallbackJobs;
  }
  if (path.startsWith("/api/v1/career-gap")) {
    return {
      target: "Backend Engineer - Tokyo",
      readiness: 76,
      current_skills: ["Python", "React", "AWS", "PostgreSQL"],
      suggested_learning_order: ["Kubernetes", "Terraform", "Spring Boot", "Japanese N2"],
      target_roles: ["Backend Engineer", "AI Engineer", "Cloud Engineer"],
      missing_skills: [
        {
          skill: "Kubernetes",
          importance: "High",
          current_level: "Learning",
          target_level: "Production ready",
          reason: "Common requirement for platform and backend roles in Japan tech teams.",
          estimated_difficulty: "Hard"
        }
      ]
    };
  }
  if (path.startsWith("/api/v1/companies")) {
    return [
      {
        id: "vercel-demo-company",
        name: "Sakura AI Systems",
        industry: "AI SaaS",
        location: "Tokyo",
        company_size: "51-200",
        work_style: "Hybrid",
        tech_stack: ["Python", "FastAPI", "PostgreSQL", "AWS"],
        visa_information: "Possible",
        open_jobs: 4
      }
    ];
  }
  return null;
}
