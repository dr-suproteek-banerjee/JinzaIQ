import { NextResponse } from "next/server";
import { getJobData } from "@/lib/jobs";
import { defaultProfile, type CandidateProfile } from "@/lib/matching";
import { parseResume } from "@/lib/resume";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("resume");
    if (!(file instanceof File)) return NextResponse.json({ error: "Choose a resume to analyze." }, { status: 400 });
    const parsed = await parseResume(file);
    let supplied: Partial<CandidateProfile> = {};
    const profileValue = form.get("profile");
    if (typeof profileValue === "string" && profileValue.length < 10_000) {
      try { supplied = JSON.parse(profileValue) as Partial<CandidateProfile>; } catch { supplied = {}; }
    }
    const profile: CandidateProfile = { ...defaultProfile, ...supplied, skills: Array.from(new Set([...(supplied.skills ?? []), ...parsed.skills])) };
    const data = await getJobData(profile);
    return NextResponse.json({ filename: file.name, wordCount: parsed.wordCount, extractedSkills: parsed.skills, profile, matches: data.items.slice(0, 12), sources: data.sources, privacy: "Processed in memory for this request; the resume file was not stored." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Resume analysis failed.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
