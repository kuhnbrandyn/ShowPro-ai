import { NextResponse } from "next/server";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
ffmpeg.setFfmpegPath(ffmpegPath!);

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

    // Save temp video
    const buffer = Buffer.from(await file.arrayBuffer());
    const videoPath = path.join("/tmp", file.name);
    fs.writeFileSync(videoPath, buffer);

    // Extract audio
    const audioPath = path.join("/tmp", `${file.name}.mp3`);
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    // Transcribe with Whisper
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    return NextResponse.json({ success: true, transcript });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
