import Link from "next/link";

export default function NotFound() {
  return (
    <section className="card empty-state">
      <div className="empty-icon" aria-hidden>404</div>
      <h1>That opportunity isn&apos;t here.</h1>
      <p className="subtle">The page may have moved, or the role is no longer available.</p>
      <Link className="button" href="/jobs">Return to job discovery</Link>
    </section>
  );
}
