export default function SavedPage() {
  return (
    <>
      <h1 className="page-title">Application Tracker</h1>
      <section className="grid stats" style={{ marginTop: 16 }}>
        {["Saved", "Applied", "Interview", "Offer", "Rejected"].map((status, index) => (
          <div className="card" key={status}><div className="subtle">{status}</div><div className="metric">{[12, 8, 2, 0, 3][index]}</div></div>
        ))}
      </section>
    </>
  );
}
