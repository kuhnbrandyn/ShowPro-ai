"use client";
import { useState } from "react";
import jsPDF from "jspdf";

export default function UploadPage() {
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState("");
  const [itemsSold, setItemsSold] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---- Function: Run AI Analysis ----
  async function handleAnalyze(e) {
    e.preventDefault();
    if (!transcript.trim()) return alert("Please paste your transcript");
    setLoading(true);
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcript,
        durationSeconds: Number(duration) || null,
        itemsSold: Number(itemsSold) || null,
      }),
    });
    const json = await res.json();
    setLoading(false);
    setResult(json);
  }

  // ---- Function: Download Report as PDF ----
  function handleDownloadPDF() {
    if (!result) return;

    const doc = new jsPDF();
    let y = 20;

    doc.setFontSize(18);
    doc.text("ShowPro AI Performance Report", 20, y);
    y += 10;

    doc.setFontSize(12);
    doc.text(`Energy: ${result.energy_score}`, 20, (y += 10));
    doc.text(`Clarity: ${result.clarity_score}`, 20, (y += 8));
    doc.text(`Sales Skill: ${result.sales_score}`, 20, (y += 8));
    if (result.sales_per_min)
      doc.text(`Sales/min: ${result.sales_per_min}`, 20, (y += 8));

    y += 10;
    doc.setFontSize(14);
    doc.text("Summary", 20, y);
    doc.setFontSize(11);
    const splitSummary = doc.splitTextToSize(result.analysis_summary, 170);
    doc.text(splitSummary, 20, (y += 8));

    if (result.improvement_actions?.length) {
      y += 10;
      doc.setFontSize(14);
      doc.text("Improvement Actions", 20, y);
      doc.setFontSize(11);
      result.improvement_actions.forEach((a) => {
        y += 8;
        doc.text(`• ${a.title}: ${a.detail}`, 20, y);
      });
    }

    doc.save("ShowProAI_Report.pdf");
  }

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto", padding: 20 }}>
      <h1>Analyze Your Show</h1>
      <p>Paste your transcript below for instant AI feedback and a downloadable report.</p>

      <form onSubmit={handleAnalyze}>
        <textarea
          rows={8}
          placeholder="Paste your transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          style={{ width: "100%", marginTop: 10 }}
        />

        <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
          <input
            type="number"
            placeholder="Items Sold"
            value={itemsSold}
            onChange={(e) => setItemsSold(e.target.value)}
          />
          <input
            type="number"
            placeholder="Duration (seconds)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: 15,
            background: "black",
            color: "white",
            padding: "10px 20px",
            borderRadius: 6,
          }}
        >
          {loading ? "Analyzing..." : "Run Analysis"}
        </button>
      </form>

      {result && result.success && (
        <div
          style={{
            marginTop: 30,
            background: "white",
            border: "1px solid #e5e5e5",
            borderRadius: 12,
            padding: 24,
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0 }}>ShowPro AI Report</h2>
            <button
              onClick={handleDownloadPDF}
              style={{
                background: "#4CAF50",
                color: "white",
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
              }}
            >
              ⬇ Download PDF
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
              gap: 12,
              marginBottom: 20,
            }}
          >
            {[
              { label: "Energy", value: result.energy_score },
              { label: "Clarity", value: result.clarity_score },
              { label: "Sales Skill", value: result.sales_score },
            ].map((metric, i) => {
              const score = Number(metric.value);
              const color =
                score >= 80 ? "#4CAF50" : score >= 60 ? "#FFC107" : "#F44336";
              return (
                <div
                  key={i}
                  style={{
                    background: "#fafafa",
                    padding: "16px 12px",
                    borderRadius: 8,
                    textAlign: "center",
                    border: `2px solid ${color}`,
                  }}
                >
                  <h4 style={{ margin: 0, color }}>{metric.label}</h4>
                  <p
                    style={{
                      fontSize: 24,
                      fontWeight: 600,
                      margin: "6px 0 0",
                    }}
                  >
                    {score}
                  </p>
                </div>
              );
            })}
          </div>

          {result.sales_per_min && (
            <div
              style={{
                marginBottom: 20,
                background: "#fafafa",
                borderRadius: 8,
                padding: "12px 16px",
              }}
            >
              <strong>Sales/min:</strong> {result.sales_per_min}
              <div
                style={{
                  marginTop: 8,
                  height: 8,
                  borderRadius: 4,
                  background: "#e0e0e0",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${Math.min(
                      Number(result.sales_per_min) * 10,
                      100
                    )}%`,
                    background: "#4CAF50",
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
            </div>
          )}

          <p style={{ lineHeight: 1.6 }}>{result.analysis_summary}</p>

          {result.improvement_actions && (
            <>
              <h3 style={{ marginTop: 24 }}>Improvement Actions</h3>
              <ul style={{ lineHeight: 1.6 }}>
                {result.improvement_actions.map((a, i) => (
                  <li key={i}>
                    <strong>{a.title}:</strong> {a.detail}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </main>
  );
}

