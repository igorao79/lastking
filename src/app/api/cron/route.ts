import { NextResponse } from "next/server";
import {
  getLastChapter,
  getChapterSummaries,
  saveChapter,
  setGenerating,
  enqueueChapter,
  getNextPending,
  markQueueInProgress,
  markQueueCompleted,
  markQueueFailed,
  cleanupStaleJobs,
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
    // 1. Clean up stale/stuck jobs
    await cleanupStaleJobs();

    // 2. Check for pending jobs in queue
    let job = await getNextPending();

    // 3. If no pending jobs, enqueue next chapter
    if (!job) {
      const lastChapter = await getLastChapter();
      const nextNumber = lastChapter
        ? Number(lastChapter.chapter_number) + 1
        : 1;
      await enqueueChapter(nextNumber);
      job = await getNextPending();
    }

    if (!job) {
      return NextResponse.json({ message: "No jobs to process" });
    }

    const jobId = Number(job.id);
    const chapterNumber = Number(job.chapter_number);

    // 4. Mark in progress
    await markQueueInProgress(jobId);
    await setGenerating(true);

    // 5. Build context and generate
    const lastChapter = await getLastChapter();
    const summaries = await getChapterSummaries();

    const context = {
      chapterNumber,
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
    await saveChapter(chapterNumber, result.title, result.content, result.summary);

    // 6. Mark completed
    await markQueueCompleted(jobId);
    await setGenerating(false);

    return NextResponse.json({
      success: true,
      chapterNumber,
      title: result.title,
    });
  } catch (error) {
    await setGenerating(false);
    // Try to mark the current in-progress job as failed
    try {
      const pendingJob = await getNextPending();
      if (pendingJob) {
        await markQueueFailed(
          Number(pendingJob.id),
          error instanceof Error ? error.message : "Unknown error"
        );
      }
    } catch {
      // ignore secondary errors
    }
    console.error("Cron error:", error);
    return NextResponse.json(
      { error: "Failed to generate" },
      { status: 500 }
    );
  }
}
