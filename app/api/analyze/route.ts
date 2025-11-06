import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: Request) {
  try {
    const { transcript, durationSeconds, itemsSold } = await req.json();

    if (!transcript)
      return NextResponse.json({ error: "Missing transcript" }, { status: 400 });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert live-selling performance coach." },
        {
          role: "user",
          content: `
Analyze the following transcript and provide a JSON object with:
- energy_score (0–100)
- clarity_score (0–100)
- sales_score (0–100)
- analysis_summary (short paragraph)
- improvement_actions (array of 3 objects with title + detail)

Transcript:
${transcript}
`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(completion.choices[0].message.content ?? "{}");

    let sales_per_min = null;
    if (itemsSold && durationSeconds) {
      sales_per_min = Number(itemsSold) / (Number(durationSeconds) / 60);
    }

    return NextResponse.json({
      success: true,
      ...parsed,
      sales_per_min: sales_per_min ? sales_per_min.toFixed(2) : null,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
