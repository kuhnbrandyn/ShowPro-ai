export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        fontFamily: "system-ui, sans-serif",
        background: "#fafafa",
        color: "#111",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "#000",
          color: "#fff",
          padding: "20px 40px",
          borderBottom: "3px solid #c6a661", // gold accent line
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "1.8rem", letterSpacing: "-0.5px" }}>
          ShowPro AI Dashboard
        </h1>

        <nav style={{ display: "flex", gap: "16px" }}>
          <a
            href="/dashboard/upload"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 6,
              transition: "0.2s ease",
              background: "rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#c6a661")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            📄 Text Analysis
          </a>

          <a
            href="/dashboard/playback"
            style={{
              color: "#fff",
              textDecoration: "none",
              fontWeight: 500,
              padding: "8px 14px",
              borderRadius: 6,
              transition: "0.2s ease",
              background: "rgba(255,255,255,0.08)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "#c6a661")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.08)")
            }
          >
            🎥 Playback Coach
          </a>
        </nav>
      </header>

      {/* Main content */}
      <main style={{ maxWidth: 1000, margin: "40px auto", padding: "0 20px" }}>
        {children}
      </main>
    </div>
  );
}
