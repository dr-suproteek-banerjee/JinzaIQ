import type { JobWithMatch, MatchAnalysis } from "./api";

export type CandidateProfile = {
  name: string;
  headline: string;
  targetRole: string;
  location: string;
  workStyle: string;
  japaneseLevel: string;
  visaStatus: string;
  yearsExperience: number;
  skills: string[];
  summary: string;
};

export const defaultProfile: CandidateProfile = {
  name: "Alex Morgan",
  headline: "Backend & cloud engineer",
  targetRole: "Software Engineer",
  location: "Tokyo",
  workStyle: "Hybrid",
  japaneseLevel: "N5",
  visaStatus: "Requires sponsorship",
  yearsExperience: 3,
  skills: ["Python", "FastAPI", "AWS", "PostgreSQL", "React", "Docker"],
  summary: "Product-minded engineer building reliable APIs, cloud systems, and practical AI experiences."
};

const SKILLS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Java", "Kotlin", "Go", "Ruby", "Rails",
  "C++", "C#", ".NET", "Rust", "PHP", "Laravel", "Swift", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis",
  "AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "FastAPI", "Django", "Flask", "Spring Boot",
  "GraphQL", "REST", "Kafka", "Machine Learning", "LLM", "PyTorch", "TensorFlow", "Git", "CI/CD", "Linux",
  "Figma", "Product Management", "Data Analysis", "Snowflake", "Spark", "English", "Japanese"
] as const;

function normalized(value: string) {
  return value.toLowerCase().replace(/[.#+/-]/g, "").replace(/\s+/g, " ").trim();
}

export function extractSkills(text: string) {
  const haystack = ` ${normalized(text)} `;
  return SKILLS.filter((skill) => {
    const needle = normalized(skill);
    return haystack.includes(` ${needle} `) || haystack.includes(`${needle},`) || haystack.includes(`${needle})`);
  });
}

const japaneseRank: Record<string, number> = { None: 0, N5: 1, N4: 2, N3: 3, N2: 4, N1: 5, Native: 6 };

export function matchJob(job: JobWithMatch["job"], profile: CandidateProfile): MatchAnalysis {
  const candidateSkills = new Set(profile.skills.map(normalized));
  const required = job.required_skills;
  const matched = required.filter((skill) => candidateSkills.has(normalized(skill)));
  const missing = required.filter((skill) => !candidateSkills.has(normalized(skill)));
  const skillScore = required.length ? Math.round((matched.length / required.length) * 100) : 65;
  const titleText = normalized(`${profile.targetRole} ${profile.headline}`);
  const titleTokens = normalized(job.title).split(" ").filter((word) => word.length > 3);
  const semanticScore = Math.min(100, 48 + titleTokens.filter((word) => titleText.includes(word)).length * 18 + matched.length * 4);
  const requiredJapanese = japaneseRank[job.japanese_requirement] ?? 0;
  const candidateJapanese = japaneseRank[profile.japaneseLevel] ?? 0;
  const languageScore = requiredJapanese === 0 ? 100 : Math.min(100, Math.round((candidateJapanese / requiredJapanese) * 100));
  const locationScore = job.location.toLowerCase().includes(profile.location.toLowerCase()) || job.remote_policy.toLowerCase().includes("remote") ? 100 : 62;
  const visaScore = profile.visaStatus.toLowerCase().includes("not") ? 100 : job.visa_sponsorship.toLowerCase().includes("sponsor") ? 88 : 48;
  const experienceScore = job.experience_level.toLowerCase().includes("senior") && profile.yearsExperience < 5 ? 58 : 88;
  const score = Math.round(skillScore * .42 + semanticScore * .18 + languageScore * .14 + locationScore * .1 + visaScore * .1 + experienceScore * .06);
  const risks = [] as string[];
  if (languageScore < 70) risks.push(`The listing asks for ${job.japanese_requirement} Japanese; your profile is set to ${profile.japaneseLevel}.`);
  if (visaScore < 60) risks.push("Sponsorship is not confirmed. Verify eligibility with the employer before investing time.");
  return {
    match_score: score,
    skill_match_score: skillScore,
    experience_match_score: experienceScore,
    language_match_score: languageScore,
    location_match_score: locationScore,
    visa_score: visaScore,
    salary_score: 70,
    semantic_score: semanticScore,
    matched_skills: matched,
    missing_skills: missing,
    nice_to_have_skills: job.preferred_skills.filter((skill) => !candidateSkills.has(normalized(skill))),
    risks,
    recommendations: [...missing.slice(0, 3), ...(languageScore < 70 ? [job.japanese_requirement] : [])],
    summary: score >= 80 ? "Excellent alignment across skills, role intent, and practical constraints." : score >= 65 ? "Promising match with a few concrete gaps to address." : "A stretch role; review the gaps before applying.",
    confidence: job.source_type === "live" ? "listing-based" : "curated demo"
  };
}

export function withMatches(jobs: JobWithMatch["job"][], profile = defaultProfile): JobWithMatch[] {
  return jobs.map((job) => ({ job, match: matchJob(job, profile) })).sort((a, b) => b.match.match_score - a.match.match_score);
}
