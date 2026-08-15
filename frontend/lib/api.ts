export type MatchAnalysis = {
  match_score: number;
  skill_match_score: number;
  experience_match_score: number;
  language_match_score: number;
  location_match_score: number;
  visa_score: number;
  salary_score: number;
  semantic_score: number;
  matched_skills: string[];
  missing_skills: string[];
  nice_to_have_skills: string[];
  risks: string[];
  recommendations: string[];
  summary: string;
  confidence: string;
};

export type JobWithMatch = {
  job: {
    id: string;
    title: string;
    company: { id: string; name: string; industry: string; location: string; tech_stack: string[]; open_jobs: number };
    location: string;
    remote_policy: string;
    salary_min: number | null;
    salary_max: number | null;
    japanese_requirement: string;
    visa_sponsorship: string;
    experience_level: string;
    required_skills: string[];
    preferred_skills: string[];
    responsibilities: string[];
    benefits: string[];
    posting_date: string;
    estimated_freshness: string;
    application_url: string;
    source_name: string;
    source_type: "live" | "curated";
    source_url: string;
    description: string;
  };
  match: MatchAnalysis;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const API_TOKEN = process.env.JINZAIQ_DEMO_TOKEN;

export function isDemoMode() {
  return !API_URL;
}

export async function apiGet<T>(path: string): Promise<T> {
  if (!API_URL) {
    const fallback = fallbackForPath(path);
    if (fallback !== null) {
      return fallback as T;
    }
    throw new Error(`No demo data is available for ${path}`);
  }

  if (!API_TOKEN) {
    throw new Error("JINZAIQ_DEMO_TOKEN must be configured when NEXT_PUBLIC_API_URL is set");
  }

  const response = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${API_TOKEN}` },
    cache: "no-store",
    signal: AbortSignal.timeout(8_000)
  });
  if (!response.ok) throw new Error(`API request failed: ${response.status}`);
  return response.json() as Promise<T>;
}

export function yen(value: number | null) {
  if (!value) return "Salary not listed";
  return `¥${Math.round(value / 10000).toLocaleString()}万`;
}

export function salaryRange(min: number | null, max: number | null) {
  if (!min && !max) return "Compensation not listed";
  if (min && max) return `${yen(min)} – ${yen(max)}`;
  return min ? `From ${yen(min)}` : `Up to ${yen(max)}`;
}
import { fallbackForPath } from "./fallbackData";
