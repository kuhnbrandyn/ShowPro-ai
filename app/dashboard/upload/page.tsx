"use client";
import { useState } from "react";

export default function UploadPage() {
  const [transcript, setTranscript] = useState("");
  const [duration, setDuration] = useState("");
  const [itemsSold, setItemsSold] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <main style={{ maxWidth: 700, margin: "2rem auto", padding: 20 }}>
      <h1>Analyze Your Show</h1>
      <p>Paste your transcript below for instant AI feedback.</p>

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

      {result && (
        <div
          style={{
            marginTop: 30,
            border: "1px solid #eee",
            padding: 20,
            borderRadius: 8,
          }}
        >
          {result.error && <p style={{ color: "red" }}>{result.error}</p>}
          {result.success && (
            <>
              <h2>ShowPro AI Report</h2>
              <p><strong>Energy:</strong> {result.energy_score}</p>
              <p><strong>Clarity:</strong> {result.clarity_score}</p>
              <p><strong>Sales Skill:</strong> {result.sales_score}</p>
              {result.sales_per_min && (
                <p><strong>Sales/min:</strong> {result.sales_per_min}</p>
              )}
              <p>{result.analysis_summary}</p>
              {result.improvement_actions && (
                <>
                  <h3>Improvement Actions</h3>
                  <ul>
                    {result.improvement_actions.map((a, i) => (
                      <li key={i}>{a.title}: {a.detail}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </div>
      )}
    </main>
  );
}
