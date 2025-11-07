import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // ✅ Save the file temporarily
    const buffer = Buffer.from(await file.arrayBuffer());
    const videoPath = path.join("/tmp", file.name);
    fs.writeFileSync(videoPath, buffer);

    // ✅ Whisper can directly handle MOV, MP4, MP3, WAV, M4A, etc.
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(videoPath),
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
