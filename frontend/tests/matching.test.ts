import { describe, expect, it } from "vitest";
import { extractSkills, matchJob, defaultProfile } from "../lib/matching";
import type { JobWithMatch } from "../lib/api";

const role: JobWithMatch["job"] = {
  id: "test", title: "Backend Engineer", company: { id: "company", name: "Test", industry: "Technology", location: "Tokyo", tech_stack: [], open_jobs: 1 },
  location: "Tokyo", remote_policy: "Hybrid", salary_min: null, salary_max: null, japanese_requirement: "None", visa_sponsorship: "Likely sponsors", experience_level: "Mid-level",
  required_skills: ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"], preferred_skills: ["Kubernetes"], responsibilities: [], benefits: [], posting_date: "2026-08-15", estimated_freshness: "test", application_url: "https://example.com", source_name: "Test", source_type: "curated", source_url: "https://example.com", description: "A backend role"
};

describe("resume skill extraction", () => {
  it("recognizes technologies without inventing unrelated skills", () => {
    const skills = extractSkills("Built Python FastAPI services on AWS with PostgreSQL and Docker.");
    expect(skills).toEqual(expect.arrayContaining(["Python", "FastAPI", "AWS", "PostgreSQL", "Docker"]));
    expect(skills).not.toContain("Kubernetes");
  });
});

describe("job matching", () => {
  it("scores a skill-aligned role above a deliberately unrelated profile", () => {
    const aligned = matchJob(role, defaultProfile);
    const unrelated = matchJob(role, { ...defaultProfile, targetRole: "Designer", headline: "Brand designer", skills: ["Figma"] });
    expect(aligned.match_score).toBeGreaterThan(unrelated.match_score);
    expect(aligned.matched_skills).toContain("Python");
    expect(unrelated.missing_skills).toContain("Python");
  });
});
