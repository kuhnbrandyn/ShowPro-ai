import { NextResponse } from "next/server";
import OpenAI from "openai";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";

// Allow larger uploads (fixes 413 Payload Too Large)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "50mb",
    },
  },
};

// Ensure Node runtime for file handling
export const runtime = "nodejs";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

ffmpeg.setFfmpegPath(ffmpegPath!);

export async function POST(req: Request) {
  try {
    // Parse multipart/form-data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Write video to a temporary directory
    const buffer = Buffer.from(await file.arrayBuffer());
    const tmpDir = "/tmp";
    const videoPath = path.join(tmpDir, file.name);
    fs.writeFileSync(videoPath, buffer);

    // Convert video to audio (mp3) using ffmpeg
    const audioPath = path.join(tmpDir, `${file.name}.mp3`);
    await new Promise<void>((resolve, reject) => {
      ffmpeg(videoPath)
        .output(audioPath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });

    // Transcribe audio using OpenAI Whisper
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioPath),
      model: "whisper-1",
      response_format: "text",
    });

    // Cleanup temp files
    try {
      fs.unlinkSync(videoPath);
      fs.unlinkSync(audioPath);
    } catch {
      // silently ignore cleanup errors
    }

    // Return transcript text
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
