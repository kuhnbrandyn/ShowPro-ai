import { NextResponse } from "next/server";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

// ✅ Next.js 14+ way to configure upload limit
export const maxDuration = 60; // function runtime max time in seconds
export const runtime = "nodejs"; // required for fs and ffmpeg
export const dynamic = "force-dynamic"; // ensure it runs at request time

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

ffmpeg.setFfmpegPath(ffmpegPath!);

export async function POST(req: Request) {
  try {
    // Parse multipart form
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Write video to /tmp (Vercel’s writable temp dir)
    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = "/tmp";
    const videoPath = path.join(tmpDir, file.name);
    fs.writeFileSync(videoPath, buffer);

    // Convert video -> audio (.mp3)
    const audioPath = path.join(tmpDir, `${file.name}.mp3`);
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    // Transcribe audio using Whisper
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    // Cleanup temp files
    try {
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
    } catch (cleanupErr) {
      console.warn("Cleanup failed:", cleanupErr);
    }

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}

