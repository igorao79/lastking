"use client";

import { useState, useEffect, useCallback } from "react";
import ChapterNav from "@/components/ChapterNav";
import ChapterReader from "@/components/ChapterReader";

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
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchChapters = useCallback(async () => {
    try {
      const res = await fetch("/api/chapters");
      const data = await res.json();
      const ch = data.chapters || [];
      setChapters(ch);
      if (ch.length > 0 && selectedChapter === null) {
        setSelectedChapter(Number(ch[ch.length - 1].chapter_number));
      }
    } catch (err) {
      console.error("Failed to fetch chapters:", err);
    } finally {
      setIsLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const currentChapter = chapters.find(
    (c) => Number(c.chapter_number) === selectedChapter
  );

  const handleSelect = (num: number) => {
    setSelectedChapter(num);
    setSidebarOpen(false);
  };

  const handlePrev = () => {
    if (!currentChapter) return;
    const idx = chapters.findIndex(
      (c) => Number(c.chapter_number) === selectedChapter
    );
    if (idx > 0) setSelectedChapter(Number(chapters[idx - 1].chapter_number));
  };

  const handleNext = () => {
    if (!currentChapter) return;
    const idx = chapters.findIndex(
      (c) => Number(c.chapter_number) === selectedChapter
    );
    if (idx < chapters.length - 1)
      setSelectedChapter(Number(chapters[idx + 1].chapter_number));
  };

  const currentIdx = chapters.findIndex(
    (c) => Number(c.chapter_number) === selectedChapter
  );
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < chapters.length - 1;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold/60 text-lg animate-pulse">Загрузка...</div>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center text-text-secondary">
          <div className="text-6xl mb-6 opacity-20">&#9733;</div>
          <p className="text-xl mb-2">Книга ещё пишется...</p>
          <p className="text-sm opacity-60">
            Первая глава появится совсем скоро
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Mobile chapter toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gold text-bg-dark flex items-center justify-center shadow-lg shadow-gold/20 hover:scale-105 transition-transform"
        aria-label="Открыть оглавление"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h7"
          />
        </svg>
      </button>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-0 h-screen w-72 max-w-[85vw] bg-bg-dark border-r border-white/5 overflow-y-auto z-40 transition-transform duration-300 lg:translate-x-0 shrink-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 pt-6">
          <h2 className="text-gold text-sm font-bold tracking-wide mb-1 px-2">
            Последний король
          </h2>
          <p className="text-text-secondary/50 text-xs px-2 mb-4">
            {chapters.length}{" "}
            {chapters.length === 1
              ? "глава"
              : chapters.length < 5
                ? "главы"
                : "глав"}
          </p>
          <ChapterNav
            chapters={chapters}
            selectedChapter={selectedChapter}
            onSelect={handleSelect}
          />
        </div>
      </aside>

      {/* Main reading area */}
      <main className="flex-1 min-w-0 max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {currentChapter && (
          <>
            <ChapterReader chapter={currentChapter} />

            {/* Navigation */}
            <nav className="mt-12 flex items-center justify-between gap-4">
              <button
                onClick={handlePrev}
                disabled={!hasPrev}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all ${
                  hasPrev
                    ? "bg-bg-card border border-white/10 hover:border-gold/30 text-text-primary hover:text-gold"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <span>&larr;</span>
                <span className="hidden sm:inline">Предыдущая</span>
              </button>

              <span className="text-text-secondary/40 text-xs">
                {currentIdx + 1} / {chapters.length}
              </span>

              <button
                onClick={handleNext}
                disabled={!hasNext}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all ${
                  hasNext
                    ? "bg-bg-card border border-white/10 hover:border-gold/30 text-text-primary hover:text-gold"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <span className="hidden sm:inline">Следующая</span>
                <span>&rarr;</span>
              </button>
            </nav>
          </>
        )}
      </main>
    </div>
  );
}
