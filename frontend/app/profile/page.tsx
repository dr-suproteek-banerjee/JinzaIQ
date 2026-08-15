import { ProfileEditor } from "@/components/ProfileEditor";

export const metadata = { title: "Candidate Profile" };

export default function ProfilePage() {
  return (
    <>
      <div className="page-heading"><span className="kicker">Candidate workspace</span><h1 className="page-title">Your career profile, in focus.</h1><p className="hero-copy subtle">Fine-tune the signals that shape every match. Your data stays in this browser until you choose to upload a resume for one-time analysis.</p></div>
      <ProfileEditor />
    </>
  );
}
