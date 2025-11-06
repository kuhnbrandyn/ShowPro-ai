export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ padding: "20px", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ marginBottom: 20 }}>
        <h1>ShowPro AI Dashboard</h1>
        <nav style={{ marginTop: 10, display: "flex", gap: "10px" }}>
          <a href="/dashboard/upload">📄 Text Analysis</a>
          <a href="/dashboard/playback">🎥 Playback Coach</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
