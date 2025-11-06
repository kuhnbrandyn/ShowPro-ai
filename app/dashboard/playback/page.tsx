"use client";
import { useState } from "react";
import ReactPlayer from "react-player";

export default function PlaybackPage() {
  const [video, setVideo] = useState<File | null>(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!video) return alert("Please upload a video first");

    const formData = new FormData();
    formData.append("file", video);

    setLoading(true);
    const res = await fetch("/api/upload-video", {
      method: "POST",
      body: formData,
    });
    const json = await res.json();
    setLoading(false);

    if (json.error) return alert(json.error);
    setTranscript(json.transcript);
  }

  return (
    <main style={{ maxWidth: 800, margin: "2rem auto", padding: 20 }}>
      <h1>ShowPro AI Playback Coach</h1>
      <p>Upload your show recording and get a breakdown by timestamp.</p>

      <form onSubmit={handleUpload} style={{ marginBottom: 20 }}>
        <input
          type="file"
          accept="video/*"
          onChange={(e) => setVideo(e.target.files?.[0] || null)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            marginLeft: 10,
            background: "black",
            color: "white",
            padding: "8px 16px",
            borderRadius: 6,
          }}
        >
          {loading ? "Processing..." : "Upload & Analyze"}
        </button>
      </form>

      {video && (
        <div style={{ marginBottom: 20 }}>
          <ReactPlayer
            url={URL.createObjectURL(video)}
            controls
            width="100%"
            height="360px"
          />
        </div>
      )}

      {transcript && (
        <div
          style={{
            whiteSpace: "pre-wrap",
            background: "#fafafa",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <h3>Transcript</h3>
          <p>{transcript}</p>
        </div>
      )}
    </main>
  );
}
