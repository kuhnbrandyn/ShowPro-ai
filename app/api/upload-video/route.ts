import { NextResponse } from "next/server";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutes

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 🧩 Ensure ffmpeg-static path is resolved correctly
if (!ffmpegStatic) {
  console.error("❌ ffmpeg-static not found!");
} else {
  ffmpeg.setFfmpegPath(ffmpegStatic);
  console.log("✅ ffmpeg path set:", ffmpegStatic);
}

export async function POST(req: Request) {
  console.log("✅ /api/upload-video route hit");

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      console.log("❌ No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📦 File received:", file.name, file.size);

    // Save uploaded video temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = "/tmp";
    const videoPath = path.join(tmpDir, file.name);
    fs.writeFileSync(videoPath, buffer);
    console.log("💾 Video written to:", videoPath);

    // Prepare output path
    const audioPath = path.join(tmpDir, `${file.name}.mp3`);

    // 🧠 Convert to audio
    console.log("🎧 Starting ffmpeg conversion...");
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .noVideo()
        .audioCodec("libmp3lame")
        .save(audioPath)
        .on("end", () => {
          console.log("🎧 Audio extracted successfully:", audioPath);
          resolve();
        })
        .on("error", (err) => {
          console.error("❌ ffmpeg error:", err);
          reject(err);
        });
    });

    console.log("🧩 Checking audio file...");
    if (!fs.existsSync(audioPath)) {
      throw new Error("Audio extraction failed — no output file found.");
    }

    console.log("🧠 Sending to Whisper for transcription...");
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    console.log("📝 Whisper returned transcript successfully");

    // Cleanup
    try {
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
      console.log("🧹 Temp files cleaned up");
    } catch (cleanupErr) {
      console.warn("⚠️ Cleanup failed:", cleanupErr);
    }

    console.log("✅ Upload route complete");
    return NextResponse.json({ success: true, transcript });
  } catch (error: any) {
    console.error("❌ Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

