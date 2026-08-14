export default function SettingsPage() {
  return (
    <>
      <h1 className="page-title">Settings</h1>
      <div className="card" style={{ marginTop: 16 }}>
        <p>AI provider: Mock. Embedding provider: Mock. Production providers are selected with environment variables.</p>
      </div>
    </>
  );
}
