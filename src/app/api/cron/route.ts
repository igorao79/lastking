import { NextResponse } from "next/server";
import {
  getLastChapter,
  getChapterSummaries,
  saveChapter,
  setGenerating,
  getBookMeta,
} from "@/lib/db";
import { generateChapter } from "@/lib/groq";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const meta = await getBookMeta();
    if (meta && Number(meta.is_generating) === 1) {
      return NextResponse.json({ message: "Already generating" });
    }

    await setGenerating(true);

    const lastChapter = await getLastChapter();
    const summaries = await getChapterSummaries();
    const nextNumber = lastChapter
      ? Number(lastChapter.chapter_number) + 1
      : 1;

    const context = {
      chapterNumber: nextNumber,
      previousChapterSummary: lastChapter
        ? `${String(lastChapter.content).slice(0, 1000)}\n\nИтог: ${String(lastChapter.summary)}`
        : undefined,
      allSummaries: summaries.map((s) => ({
        chapter_number: Number(s.chapter_number),
        title: String(s.title),
        summary: String(s.summary),
      })),
    };

    const result = await generateChapter(context);
    await saveChapter(nextNumber, result.title, result.content, result.summary);
    await setGenerating(false);

    return NextResponse.json({
      success: true,
      chapterNumber: nextNumber,
      title: result.title,
    });
  } catch (error) {
    await setGenerating(false);
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Failed to generate" },
      { status: 500 }
    );
  }
}
