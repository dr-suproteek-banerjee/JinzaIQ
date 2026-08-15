"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="card empty-state" role="alert">
      <div className="empty-icon" aria-hidden>!</div>
      <h1>We couldn&apos;t load this intelligence view.</h1>
      <p className="subtle">The data service may be temporarily unavailable. Your information has not been changed.</p>
      <button className="button" type="button" onClick={reset}>Try again</button>
    </section>
  );
}
