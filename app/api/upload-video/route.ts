import { NextResponse } from "next/server";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ✅ Required so fluent-ffmpeg can find ffmpeg binary in Vercel
ffmpeg.setFfmpegPath(ffmpegPath!);

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save uploaded video temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const videoPath = path.join("/tmp", file.name);
    fs.writeFileSync(videoPath, buffer);

    // Extract audio as .mp3 using ffmpeg-static binary
    const audioPath = path.join("/tmp", `${file.name}.mp3`);
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .audioCodec("libmp3lame")
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    // Send extracted audio to OpenAI Whisper for transcription
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ success: true, transcript: transcription });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err.message || "Upload failed" },
      { status: 500 }
    );
  }
}
