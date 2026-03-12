"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import ChapterList from "@/components/ChapterList";
import ChapterReader from "@/components/ChapterReader";
import StreamingView from "@/components/StreamingView";
import GenerateButton from "@/components/GenerateButton";

interface Chapter {
  id: number;
  chapter_number: number;
  title: string;
  content: string;
  summary: string;
  created_at: string;
}

export default function Home() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [streamChapterNum, setStreamChapterNum] = useState(0);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch("/api/chapters");
      const data = await res.json();
      setChapters(data.chapters || []);
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    }
  }, []);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setStreamText("");
    setSelectedChapter(null);

    try {
      const eventSource = new EventSource("/api/stream");

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "start":
            setStreamChapterNum(data.chapterNumber);
            break;
          case "chunk":
            setStreamText((prev) => prev + data.content);
            break;
          case "done":
            eventSource.close();
            setIsGenerating(false);
            setStreamText("");
            fetchChapters().then(() => {
              setSelectedChapter(data.chapterNumber);
            });
            break;
          case "error":
            eventSource.close();
            setIsGenerating(false);
            setStreamText("");
            break;
        }
      };

      eventSource.onerror = () => {
        eventSource.close();
        setIsGenerating(false);
        setStreamText("");
      };
    } catch {
      setIsGenerating(false);
      setStreamText("");
    }
  }, [fetchChapters]);

  const currentChapter = chapters.find(
    (c) => Number(c.chapter_number) === selectedChapter
  );

  return (
    <div className="min-h-screen">
      <Header totalChapters={chapters.length} />

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Generate button */}
        <div className="mb-8">
          <GenerateButton
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
          />
        </div>

        {/* Streaming view */}
        {isGenerating && streamText && (
          <div className="mb-8">
            <StreamingView text={streamText} chapterNumber={streamChapterNum} />
          </div>
        )}

        {/* Chapter reader or chapter list */}
        {currentChapter && !isGenerating ? (
          <ChapterReader
            chapter={currentChapter}
            onBack={() => setSelectedChapter(null)}
          />
        ) : (
          !isGenerating && (
            <ChapterList
              chapters={chapters}
              selectedChapter={selectedChapter}
              onSelect={setSelectedChapter}
            />
          )
        )}
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-text-secondary/40 text-xs">
        <p>
          Последний король &mdash; создаётся искусственным интеллектом, глава за
          главой
        </p>
      </footer>
    </div>
  );
}
