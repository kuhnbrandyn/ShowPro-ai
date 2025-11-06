export default function Home() {
  return (
    <main style={{ textAlign: "center", padding: "4rem" }}>
      <h1>ShowPro AI</h1>
      <p>Upload your live show and get an instant performance report.</p>
      <a
        href="/dashboard/upload"
        style={{
          marginTop: 20,
          display: "inline-block",
          background: "black",
          color: "white",
          padding: "12px 24px",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Analyze Your Show →
      </a>
    </main>
  );
}
