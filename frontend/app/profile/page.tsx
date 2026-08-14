export default function ProfilePage() {
  return (
    <>
      <h1 className="page-title">Candidate Profile</h1>
      <form className="card grid" style={{ marginTop: 16, maxWidth: 860 }}>
        <input className="input" placeholder="Target role" defaultValue="Software Engineer" />
        <input className="input" placeholder="Desired Japan location" defaultValue="Tokyo" />
        <select className="select" defaultValue="None">
          {["None", "N5", "N4", "N3", "N2", "N1", "Native"].map((level) => <option key={level}>{level}</option>)}
        </select>
        <textarea className="textarea" defaultValue="Python, React, AWS, PostgreSQL, FastAPI" />
        <button className="button" type="button">Save profile</button>
      </form>
    </>
  );
}
