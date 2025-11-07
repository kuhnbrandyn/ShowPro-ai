import { NextResponse } from "next/server";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const runtime = "nodejs";

// Initialize ffmpeg WASM once globally (for performance)
let ffmpeg: any;
async function loadFFmpeg() {
  if (!ffmpeg) {
    ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();
  }
  return ffmpeg;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Prepare temporary paths
    const buffer = Buffer.from(await file.arrayBuffer());
    const videoName = file.name.replace(/\s+/g, "_");
    const tmpAudioPath = path.join("/tmp", `${videoName}.mp3`);

    // Load ffmpeg WASM
    const ffmpeg = await loadFFmpeg();

    // Write uploaded file into ffmpeg's virtual FS
    ffmpeg.FS("writeFile", videoName, await fetchFile(buffer));

    // Extract audio track from the uploaded video
    await ffmpeg.run("-i", videoName, "-vn", "-acodec", "libmp3lame", "output.mp3");

    // Read the resulting audio file from ffmpeg memory
    const audioData = ffmpeg.FS("readFile", "output.mp3");
    fs.writeFileSync(tmpAudioPath, Buffer.from(audioData));

    // Send to OpenAI Whisper for transcription
    const transcript = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpAudioPath),
      model: "whisper-1",
      response_format: "text",
    });

    // Cleanup
    fs.unlinkSync(tmpAudioPath);

    return NextResponse.json({ success: true, transcript });
  } catch (error: any) {
    console.error("Error processing upload:", error);
    return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
  }
}
