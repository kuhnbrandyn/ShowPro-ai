"use client";
import { useState } from "react";
import jsPDF from "jspdf";

export default function UploadPage() {
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState("");
  const [itemsSold, setItemsSold] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ---- Run AI Analysis ----
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

  // ---- Download PDF ----
  function handleDownloadPDF() {
    if (!result) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const marginX = 40;
    let y = 60;

    // --- Header ---
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 595, 60, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text("ShowPro AI Performance Report", marginX, 38);

    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 400, 38);

    // --- Body ---
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("Overview", marginX, (y += 30));
    doc.setFontSize(12);
    doc.text(`Energy: ${result.energy_score}`, marginX, (y += 20));
    doc.text(`Clarity: ${result.clarity_score}`, marginX, (y += 16));
    doc.text(`Sales Skill: ${result.sales_score}`, marginX, (y += 16));
    if (result.sales_per_min)
      doc.text(`Sales/min: ${result.sales_per_min}`, marginX, (y += 16));

    // --- Summary ---
    doc.setFontSize(14);
    doc.text("Summary", marginX, (y += 30));
    doc.setFontSize(11);
    const wrappedSummary = doc.splitTextToSize(result.analysis_summary, 500);
    doc.text(wrappedSummary, marginX, (y += 16));

    // --- Improvement Actions ---
    if (result.improvement_actions?.length) {
      doc.setFontSize(14);
      doc.text("Improvement Actions", marginX, (y += 30));
      doc.setFontSize(11);
      result.improvement_actions.forEach((a) => {
        y += 14;
        doc.text(`• ${a.title}: ${a.detail}`, marginX, y);
      });
    }

    // --- Footer ---
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Powered by ShowPro AI", marginX, 810);

    doc.save(`ShowProAI_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  }

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto", padding: 20 }}>
      <h1>Analyze Your Show</h1>
      <p>
        Paste your transcript below for instant AI feedback and a downloadable
        branded report.
      </p>

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
