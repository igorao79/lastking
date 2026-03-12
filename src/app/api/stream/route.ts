import {
  getLastChapter,
  getChapterSummaries,
  saveChapter,
  setGenerating,
  getBookMeta,
} from "@/lib/db";
import { streamChapter } from "@/lib/groq";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET() {
  const meta = await getBookMeta();
  if (meta && Number(meta.is_generating) === 1) {
    return new Response("Already generating", { status: 409 });
  }

  await setGenerating(true);

  const lastChapter = await getLastChapter();
  const summaries = await getChapterSummaries();
  const nextNumber = lastChapter ? Number(lastChapter.chapter_number) + 1 : 1;

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

  const encoder = new TextEncoder();
  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "start", chapterNumber: nextNumber })}\n\n`
          )
        );

        for await (const chunk of streamChapter(context)) {
          fullText += chunk;
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "chunk", content: chunk })}\n\n`
            )
          );
        }

        const parts = fullText.split("---SUMMARY---");
        const chapterText = parts[0].trim();
        const summary = parts[1]?.trim() || "Краткое содержание недоступно.";

        let title = `Глава ${nextNumber}`;
        const titleMatch = chapterText.match(/^#\s*(.+)$/m);
        if (titleMatch) {
          title = titleMatch[1].trim();
        }
        const content = chapterText.replace(/^#\s*.+$/m, "").trim();

        await saveChapter(nextNumber, title, content, summary);
        await setGenerating(false);

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "done", chapterNumber: nextNumber, title })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        await setGenerating(false);
        console.error("Stream error:", error);
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: "error", message: "Generation failed" })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
