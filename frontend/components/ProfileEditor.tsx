"use client";

import { Check, RotateCcw, Save } from "lucide-react";
import { useState } from "react";
import { defaultProfile, type CandidateProfile } from "@/lib/matching";

export const PROFILE_KEY = "jinzaiq-profile-v1";

export function ProfileEditor() {
  const [profile, setProfile] = useState<CandidateProfile>(() => {
    if (typeof window === "undefined") return defaultProfile;
    const stored = window.localStorage.getItem(PROFILE_KEY);
    if (!stored) return defaultProfile;
    try { return { ...defaultProfile, ...JSON.parse(stored) }; } catch { return defaultProfile; }
  });
  const [saved, setSaved] = useState(false);

  const update = <K extends keyof CandidateProfile>(key: K, value: CandidateProfile[K]) => setProfile((current) => ({ ...current, [key]: value }));
  const save = () => { window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile)); setSaved(true); window.setTimeout(() => setSaved(false), 2200); };
  const reset = () => { setProfile(defaultProfile); window.localStorage.removeItem(PROFILE_KEY); };

  return (
    <section className="profile-layout">
      <form className="surface profile-form" onSubmit={(event) => { event.preventDefault(); save(); }}>
        <div className="section-heading"><div><span className="kicker">Your positioning</span><h2>Build a profile recruiters can understand.</h2></div><span className="privacy-chip">Private to this browser</span></div>
        <div className="form-grid">
          <label className="field"><span>Name</span><input className="input" value={profile.name} onChange={(e) => update("name", e.target.value)} /></label>
          <label className="field"><span>Headline</span><input className="input" value={profile.headline} onChange={(e) => update("headline", e.target.value)} /></label>
          <label className="field"><span>Target role</span><input className="input" value={profile.targetRole} onChange={(e) => update("targetRole", e.target.value)} /></label>
          <label className="field"><span>Preferred location</span><input className="input" value={profile.location} onChange={(e) => update("location", e.target.value)} /></label>
          <label className="field"><span>Work style</span><select className="select" value={profile.workStyle} onChange={(e) => update("workStyle", e.target.value)}><option>Hybrid</option><option>Remote</option><option>On-site</option><option>Flexible</option></select></label>
          <label className="field"><span>Japanese level</span><select className="select" value={profile.japaneseLevel} onChange={(e) => update("japaneseLevel", e.target.value)}>{["None", "N5", "N4", "N3", "N2", "N1", "Native"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label className="field"><span>Visa</span><select className="select" value={profile.visaStatus} onChange={(e) => update("visaStatus", e.target.value)}><option>Requires sponsorship</option><option>Does not require sponsorship</option><option>Prefer not to say</option></select></label>
          <label className="field"><span>Years of experience</span><input className="input" type="number" min="0" max="40" value={profile.yearsExperience} onChange={(e) => update("yearsExperience", Number(e.target.value))} /></label>
          <label className="field full"><span>Skills · comma separated</span><input className="input" value={profile.skills.join(", ")} onChange={(e) => update("skills", e.target.value.split(",").map((item) => item.trim()).filter(Boolean))} /></label>
          <label className="field full"><span>Professional summary</span><textarea className="textarea" value={profile.summary} onChange={(e) => update("summary", e.target.value)} /></label>
        </div>
        <div className="form-actions"><button className="button" type="submit">{saved ? <Check size={17} /> : <Save size={17} />}{saved ? "Saved" : "Save profile"}</button><button className="text-button" type="button" onClick={reset}><RotateCcw size={15} /> Reset demo</button></div>
      </form>
      <aside className="profile-preview">
        <span className="kicker light">Live profile card</span>
        <div className="avatar">{profile.name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
        <h2>{profile.name || "Your name"}</h2><p className="profile-headline">{profile.headline}</p>
        <div className="profile-meta"><span>{profile.location}</span><span>{profile.workStyle}</span><span>日本語 {profile.japaneseLevel}</span></div>
        <p>{profile.summary}</p><div className="pill-row">{profile.skills.slice(0, 8).map((skill) => <span className="pill dark" key={skill}>{skill}</span>)}</div>
      </aside>
    </section>
  );
}
