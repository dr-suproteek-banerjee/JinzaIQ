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
  };
  match: MatchAnalysis;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const hasExplicitApiUrl = Boolean(process.env.NEXT_PUBLIC_API_URL);

export async function demoToken() {
  const email = "suproteek.demo@example.com";
  const password = "password123";
  const register = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name: "Suproteek" }),
    cache: "no-store"
  });
  if (register.ok) return (await register.json()).access_token as string;
  const login = await fetch(`${API_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store"
  });
  return (await login.json()).access_token as string;
}

export async function apiGet<T>(path: string): Promise<T> {
  try {
    const token = await demoToken();
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!response.ok) throw new Error(`API request failed: ${response.status}`);
    return response.json() as Promise<T>;
  } catch (error) {
    const fallback = fallbackForPath(path);
    if (fallback && (process.env.VERCEL === "1" || !hasExplicitApiUrl)) {
      return fallback as T;
    }
    throw error;
  }
}

export function yen(value: number | null) {
  if (!value) return "Salary not listed";
  return `¥${Math.round(value / 10000).toLocaleString()}万`;
}
import { fallbackForPath } from "./fallbackData";
