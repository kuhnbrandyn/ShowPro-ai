export default function DashboardPage() {
  return (
    <main style={{ textAlign: "center", padding: "3rem" }}>
      <h1>ShowPro AI Dashboard</h1>
      <p>Upload or analyze a new show to get AI insights.</p>
      <a
        href="/dashboard/upload"
        style={{
          color: "white",
          background: "black",
          padding: "10px 20px",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        + Analyze a Show
      </a>
    </main>
  );
}
