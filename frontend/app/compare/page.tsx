import Link from "next/link";

export default function ComparePage() {
  return (
    <>
      <h1 className="page-title">Job Comparison</h1>
      <div className="card empty-state" style={{ marginTop: 16 }}>
        <div className="empty-icon" aria-hidden>↔</div>
        <h2>No roles selected yet</h2>
        <p className="subtle">Choose roles from discovery to compare salary, Japanese requirements, visa signals, skills, and career fit side by side.</p>
        <Link className="button" href="/jobs">Browse matching roles</Link>
      </div>
    </>
  );
}
